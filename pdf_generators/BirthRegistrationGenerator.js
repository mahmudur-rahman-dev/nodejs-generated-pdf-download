const fs = require('fs');
const pdf = require('./PdfGenerator');
const htmlTemplate = fs.readFileSync('./pdf_templates/birth-registration/birth-registration.html', 'utf8');
const moment = require('moment');
const templateEngine = require('../util/templateEngine');
// const options = { format: 'A4',  "orientation": "portrait"};
const options = { format: 'A4',  "orientation": "landscape"};
class BirthRegistrationGenerator {
    generate(res,body) {
        body.personBirthDate = moment(body.personBirthDate).format("MM/DD/YYYY");
        body.personRegDate = moment(body.personRegDate).format("MM/DD/YYYY");

       pdf.pdfGenerator(htmlTemplate,body,res,options)
    }
}

module.exports = BirthRegistrationGenerator;
