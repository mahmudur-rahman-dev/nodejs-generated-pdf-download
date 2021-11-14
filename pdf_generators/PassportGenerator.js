const fs = require('fs');
const moment = require('moment');
const htmlTemplate = fs.readFileSync('./pdf_templates/passport/passport.html', 'utf8');
const pdf = require('./PdfGenerator');
const revoked = require('../constants/passportConstant')
// const options = { format: 'A4',  "orientation": "portrait"};
const options = {format: 'A4 ', "orientation": "landscape"};

class PassportGenerator {
    constructor() {
    }

    generate(res, body) {
        //modify the body:
        body.creationTimeStamp = body.creationTimeStamp ? moment(body.creationTimeStamp).format("MM/DD/YYYY HH:mm") : "";
        body.modificationTimeStamp = moment(body.modificationTimeStamp).format("MM/DD/YYYY HH:mm");
        body.doExpiry = moment(body.doExpiry).format("MM/DD/YYYY");
        body.doIssue = moment(body.doIssue).format("MM/DD/YYYY");
        body.dob = moment(body.dob).format("MM/DD/YYYY");
        body.age = moment().diff(body.dob, "years");
        body.revokedDate = body.revokeddate ? body.revokeddate : "-";
        body.revokedImage = (body.hasOwnProperty('revokeddate') && (body.revokeddate && body.revokeddate.length > 0)) ? revoked.revoked : revoked.revokedActive;
        pdf.pdfGenerator(htmlTemplate, body, res, options)
    }
}

module.exports = PassportGenerator;
