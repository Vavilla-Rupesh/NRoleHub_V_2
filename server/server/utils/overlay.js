// const sharp = require('sharp');

// async function overlayTextOnImage(imageBuffer, name, eventName, certificateDate, coordinates, certificateId, rank = null, teamName = null) {
//   try {
//     if (!Buffer.isBuffer(imageBuffer)) {
//       throw new Error('Invalid image buffer provided');
//     }

//     // Get image dimensions
//     const metadata = await sharp(imageBuffer).metadata();
//     const { width, height } = metadata;

//     // Create SVG with exact dimensions
//     const svgText = `
//       <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
//         <style>
//           .text { 
//             font-family: Arial; 
//             fill: black; 
//             dominant-baseline: middle;
//             text-anchor: middle;
//           }
//           .name { font-size: 48px; font-weight: bold; }
//           .event { font-size: 36px; }
//           .date { font-size: 24px; }
//           .id { font-size: 16px; font-family: monospace; }
//           .rank { font-size: 36px; font-weight: bold; fill: #4F46E5; }
//           .teamName { font-size: 36px; font-weight: bold; fill: #000000; }
//         </style>
//         ${Object.entries(coordinates).map(([key, value]) => {
//           if (!value) return '';
          
//           let className = '';
//           let text = '';
          
//           switch (key) {
//             case 'name':
//               className = 'name';
//               text = name;
//               break;
//             case 'event':
//               className = 'event';
//               text = eventName;
//               break;
//             case 'date':
//               className = 'date';
//               text = certificateDate;
//               break;
//             case 'certificateId':
//               className = 'id';
//               text = certificateId;
//               break;
//             case 'rank':
//               if (rank) {
//                 className = 'rank';
//                 text = rank;
//               }
//               break;
//             case 'teamName':
//               if (teamName) {
//                 className = 'teamName';
//                 text = teamName;  // Adding the team name text
//               }
//               break;
//           }

//           if (!text) return '';

//           return `
//             <text 
//               x="${value.x}" 
//               y="${value.y}" 
//               class="text ${className}"
//             >${text}</text>
//           `;
//         }).join('')}
//       </svg>
//     `;

//     // Create a buffer from the SVG
//     const svgBuffer = Buffer.from(svgText);

//     // Composite the SVG onto the image
//     const outputBuffer = await sharp(imageBuffer)
//       .composite([{
//         input: svgBuffer,
//         top: 0,
//         left: 0,
//         blend: 'over'
//       }])
//       .jpeg({ quality: 90 })
//       .toBuffer();

//     return outputBuffer;
//   } catch (error) {
//     console.error('Error in overlayTextOnImage:', error);
//     throw error;
//   }
// }

// module.exports = overlayTextOnImage;
const sharp = require('sharp');

async function overlayTextOnImage(imageBuffer, name, eventName, certificateDate, coordinates, certificateId, rank = null, teamName = null, studentDetails = null) {
  try {
    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error('Invalid image buffer provided');
    }

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Convert year and semester to Roman numerals
    const toRoman = (num) => {
      const romanNumerals = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
        6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
      };
      return romanNumerals[num] || num.toString();
    };

    // Create SVG with exact dimensions
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .text { 
            font-family: Arial; 
            fill: black; 
            dominant-baseline: middle;
            text-anchor: middle;
          }
          .name { font-size: 48px; font-weight: bold; }
          .event { font-size: 36px; }
          .date, .college, .stream { font-size: 24px; }
          .id { font-size: 16px; font-family: monospace; }
          .rank { font-size: 36px; font-weight: bold; fill: #4F46E5; }
          .details { font-size: 18px; }
          .team { font-size: 24px; font-weight: bold; }
        </style>
        ${Object.entries(coordinates).map(([key, value]) => {
          if (!value) return '';
          
          let className = '';
          let text = '';
          
          switch (key) {
            case 'name':
              className = 'name';
              text = name;
              break;
            case 'event':
              className = 'event';
              text = eventName;
              break;
            case 'date':
              className = 'date';
              text = certificateDate;
              break;
            case 'certificateId':
              className = 'id';
              text = certificateId;
              break;
            case 'rank':
              if (rank) {
                className = 'rank';
                text = rank;
              }
              break;
            case 'teamName':
              if (teamName) {
                className = 'team';
                text = teamName;
              }
              break;
            case 'rollNumber':
              if (studentDetails?.rollNumber) {
                className = 'details';
                text = studentDetails.rollNumber;
              }
              break;
            case 'year':
              if (studentDetails?.year) {
                className = 'details';
                text = toRoman(studentDetails.year)
              }
              break;
              case 'sem':
                if (studentDetails?.semester) {
                  className = 'details';
                  text = toRoman(studentDetails.semester);
                }
                break;
                case 'stream':
                  if (studentDetails?.stream) {
                    className = 'details';
                    text = toRoman(studentDetails.stream);
                  }
                  break;
            case 'college':
              if (studentDetails?.collegeName) {
                className = 'details';
                text = studentDetails.collegeName;
              }
              break;
          }

          if (!text) return '';

          return `
            <text 
              x="${value.x}" 
              y="${value.y}" 
              class="text ${className}"
            >${text}</text>
          `;
        }).join('')}
      </svg>
    `;

    // Create a buffer from the SVG
    const svgBuffer = Buffer.from(svgText);

    // Composite the SVG onto the image
    const outputBuffer = await sharp(imageBuffer)
      .composite([{
        input: svgBuffer,
        top: 0,
        left: 0,
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    return outputBuffer;
  } catch (error) {
    console.error('Error in overlayTextOnImage:', error);
    throw error;
  }
}

module.exports = overlayTextOnImage;