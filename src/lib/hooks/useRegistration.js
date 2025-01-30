import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export function useRegistration(eventId, subEventId) {
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!eventId || !subEventId) return;
      
      try {
        setLoading(true);
        const response = await api.get('/registrations/my-registrations');
        const registration = response.data.find(
          reg => 
            reg.event_id === parseInt(eventId) && 
            reg.subevent_id === parseInt(subEventId) && 
            reg.payment_status === 'paid'
        );
        console.log('Registration status:', !!registration); // Debug log
        setIsRegistered(!!registration);
      } catch (error) {
        console.error('Failed to check registration status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [eventId, subEventId]);

  const handleRegistration = async (registrationData, onSuccess) => {
    if (registering || isRegistered) return;

    try {
      setRegistering(true);

      // Create registration first
      const registrationResponse = await api.post('/registrations/register', {
        student_id: registrationData.student_id,
        student_name: registrationData.student_name,
        student_email: registrationData.student_email,
        event_id: registrationData.event_id,
        subevent_id: registrationData.subevent_id,
        event_name: registrationData.event_name,
      });

      const registration_id = registrationResponse.data.id;

      // Create payment order
      const paymentResponse = await api.post('/payments/create', {
        ...registrationData,
        registration_id,
        amount: registrationData.fee * 100 // Convert to paise
      });

      const { order_id, key } = paymentResponse.data;

      // Initialize Razorpay
      const options = {
        key,
        amount: registrationData.fee * 100,
        currency: 'INR',
        name: 'Campus Connect',
        description: `Registration for ${registrationData.event_name}`,
        order_id,
        prefill: {
          name: registrationData.student_name,
          email: registrationData.student_email
        },
        handler: async function(response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registration_id
            };

            const verificationResponse = await api.post('/payments/verify', verificationData);
            
            if (verificationResponse.data.success) {
              setIsRegistered(true); // Update registration status
              toast.success('Registration successful!');
              onSuccess?.();
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return { handleRegistration, registering, isRegistered, loading };
}