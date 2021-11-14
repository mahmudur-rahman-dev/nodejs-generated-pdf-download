const fs = require('fs');
const pdf = require('./PdfGenerator');
const htmlTemplate = fs.readFileSync('./pdf_templates/driving-license/driving-license.html', 'utf8');
const icon = require('../constants/drivingLicense')
// const options = { format: 'A4',  "orientation": "portrait"};
const options = { format: 'A4',  "orientation": "landscape"};
class DrivingLicenseGenerator {
    constructor() {
    }
    generate(json, res) {
        pdf.pdfGenerator(htmlTemplate, json, res,options)
    }
}
module.exports = DrivingLicenseGenerator;