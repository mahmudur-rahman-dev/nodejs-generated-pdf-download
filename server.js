'use strict';

const express = require('express');
const cors = require('cors');
var getRepoInfo = require('git-repo-info');
const axios = require('axios');

// Constants
const PORT = 5010;
const HOST = '0.0.0.0';
const PDFDocument = require('pdfkit');
const NidPdfGenerator = require('./pdf_generators/NidPdfGenerator');
const PassportGenerator = require('./pdf_generators/PassportGenerator');
const DrivingLicenseGenerator = require('./pdf_generators/DrivingLicenseGenerator');
const BirthRegistrationGenerator = require('./pdf_generators/BirthRegistrationGenerator');
const VehicleRegistration = require('./pdf_generators/VehicleRegistration')
const AnalysisGenerator = require('./pdf_generators/AnalysisGenerator')
const AgencySummary = require('./pdf_generators/AgencySummary')
const {reportType} = require("./constants/reportTypes");
const config = require('./config/config');
const {getCurrentFormattedDateTime} = require('./util/dateTimeFormattor')
const corsOptions = {
    exposedHeaders: ['pdfFileName', 'Content-disposition'],
};

// App
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send({msg: "ok"});
});

app.get('/info', function (req, res) {
    const gitInfo = getRepoInfo();
    console.log('checking health...');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        status: 200,
        branch: gitInfo.branch,
        sha: gitInfo.sha,
        commiter: gitInfo.committer,
        date: gitInfo.committerDate,
        message: gitInfo.commitMessage
    }));
})

app.get('/report-download/api/v1/private/nid/pdf/print/test', (req, res) => {

    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(res);

    // Embed a font, set the font size, and render some text
    doc
        // .font('fonts/kalpurush.ttf')
        .fontSize(10)
        .text('Some text with an embedded font! আমার নাম নাজমুল আপননিই জেকোনো নামো টোলা বিশ্বাসপাড়া asdfasd হ্যালো ভাই কেমন আছেন', 100, 100);
    doc.end();
});

app.get('/passport/pdf/print/test', (req, res) => {
    const passportGenerator = new PassportGenerator();
    passportGenerator.generate(res);
});

app.post('/report-download/api/v1/private/passport/print/pdf', (req, res) => {
    console.log("Printing passport");
    let pdfFileName = "passport";

    if (req.body && req.body.passportNumber) {
        pdfFileName += "_" + req.body.passportNumber + getCurrentFormattedDateTime() + ".pdf";
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName);//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const passportGenerator = new PassportGenerator();
    passportGenerator.generate(res, req.body);
});

app.post('/report-download/api/v1/private/vehicle-registration/print/pdf', (req, res) => {
    console.log("Printing vehicle-registration");
    let pdfFileName = "vehicle-registration";

    if (req.body && req.body.vehicleRegistrationNumber) {
        pdfFileName += "_" + req.body.vehicleRegistrationNumber + getCurrentFormattedDateTime() + ".pdf";
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName);//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const vehicleRegistration = new VehicleRegistration();
    vehicleRegistration.generate(res, req.body);
});


app.post('/report-download/api/v1/private/driving-license/print/pdf', (req, res) => {
    console.log("Printing driving-license");
    let pdfFileName = "driving-license";

    if (req.body && req.body.licenseNumber) {
        pdfFileName += "_" + req.body.licenseNumber + getCurrentFormattedDateTime() + ".pdf";
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName);//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const drivingLicense = new DrivingLicenseGenerator();
    drivingLicense.generate(req.body, res);
});

app.post('/report-download/api/v1/private/nid/print/pdf', (req, res) => {
    console.log("Printing nid");
    let pdfFileName = "nid";

    if (req.body) {
        const nidDigit = req.body.nid17Digit ? req.body.nid17Digit : req.body.nid10Digit ? req.body.nid10Digit : req.body.nid13Digit ? req.body.nid13Digit : "";
        pdfFileName += "_" + nidDigit + getCurrentFormattedDateTime() + ".pdf";
    }
    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName);//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const nidPdfGenerator = new NidPdfGenerator(req.body);
    nidPdfGenerator.generate(res);
});

app.post('/report-download/api/v1/private/birth-registration/print/pdf', (req, res) => {
    let pdfFileName = "birth-registration";

    if (req.body && req.body.birthRegNo) {
        pdfFileName += "_" + req.body.birthRegNo + getCurrentFormattedDateTime() + ".pdf";
    }

    res.setHeader('Content-disposition', 'attachment; filename=' + pdfFileName);
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const birthRegistrationGenerator = new BirthRegistrationGenerator();
    birthRegistrationGenerator.generate(res, req.body);
});

app.post('/report-download/api/v1/private/agency/summary/request-type/print/pdf', (req, res) => {
    let pdfFileName = "AgencySummaryReport" + getCurrentFormattedDateTime() + ".pdf";
    res.setHeader('Content-disposition', 'attachment; filename=' + "AgencySummaryReport.pdf");//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const agencySummary = new AgencySummary();
    agencySummary.generate(res, req.body, reportType.AGENCIES);
});

app.post('/report-download/api/v1/private/agency/users/summary/request-type/print/pdf', (req, res) => {
    let pdfFileName = "AgencyUsersSummaryReport" + getCurrentFormattedDateTime() + ".pdf";
    res.setHeader('Content-disposition', 'attachment; filename=' + "AgencyUsersSummaryReport.pdf");//file name should contain nid 10 digit
    res.setHeader('Content-type', 'application/pdf');
    res.set("pdfFileName", pdfFileName);

    const agencySummary = new AgencySummary();
    agencySummary.generate(res, req.body, reportType.AGENCY_USERS);
});

app.post('/report-download/api/v1/private/analysis-report/print/pdf', async (req, res) => {
    let pdfFileName = "AnalysisReport" + getCurrentFormattedDateTime() + ".pdf";
    const analysisGenerator = new AnalysisGenerator();
    const baseUrl = config.backendApi.queryServiceBaseUrl
    const queryServicePort = config.backendApi.queryServicePort
    const analysisReportDownloadPdfUrlPath = config.backendApi.analysisReportDownloadPdfUrlPath
    const {data} = await axios.post(`${baseUrl}:${queryServicePort}/${analysisReportDownloadPdfUrlPath}`, req.body.analyticSearchItems);
    var analysisReportRequestBody = data.data;
    analysisReportRequestBody.linkAnalysisImage = req.body.linkAnalysisImage;
    res.set("pdfFileName", pdfFileName);

    analysisGenerator.generate(res, analysisReportRequestBody);
});

console.log(`Download service si running on http://${HOST}:${PORT}`);
app.listen(PORT, HOST);
