const config = require('../config/config');

const cdrAnalysisReportRequestUrl = config.backendApi.queryServiceBaseUrl +':' 
                                    +config.backendApi.queryServicePort 
                                    +config.backendApi.analysisRequestServicePath;

module.exports = {
    cdrAnalysisReportRequestUrl
}