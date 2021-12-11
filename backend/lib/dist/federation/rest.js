"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInformation = void 0;
const exception_1 = require("../exception");
const node_fetch_1 = require("node-fetch");
// export const createMeeting = async (context: SlackRestApiContext): Promise<Result<SlackGetUserInformationResponse, Error>> => {
const getUserInformation = async (context) => {
    const url = `${context.restApiBaseURL}api/decodeInformation`;
    const httpRequest = {
        token: `${context.token}`,
    };
    const requestBody = JSON.stringify(httpRequest);
    const res = await (0, node_fetch_1.default)(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    const response = (await res.json());
    if (response.success) {
        const httpResponse = response.data;
        const returnValue = { ...httpResponse };
        return new exception_1.Success(returnValue);
    }
    else {
        return new exception_1.Failure(new Error("slack federation failed..."));
    }
};
exports.getUserInformation = getUserInformation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xhbWJkYTIvZmVkZXJhdGlvbi9yZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQUF3RDtBQUN4RCwyQ0FBK0I7QUF5Qi9CLGtJQUFrSTtBQUMzSCxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxPQUE0QixFQUEyRCxFQUFFO0lBQzlILE1BQU0sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLGNBQWMsdUJBQXVCLENBQUM7SUFDN0QsTUFBTSxXQUFXLEdBQUc7UUFDaEIsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRTtLQUM1QixDQUFDO0lBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNoRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUEsb0JBQUssRUFBQyxHQUFHLEVBQUU7UUFDekIsTUFBTSxFQUFFLE1BQU07UUFDZCxJQUFJLEVBQUUsV0FBVztRQUNqQixPQUFPLEVBQUU7WUFDTCxNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLGNBQWMsRUFBRSxrQkFBa0I7U0FDckM7S0FDSixDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFxQixDQUFDO0lBQ3hELElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRTtRQUNsQixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsSUFBMkMsQ0FBQztRQUMxRSxNQUFNLFdBQVcsR0FBb0MsRUFBRSxHQUFHLFlBQVksRUFBRSxDQUFDO1FBQ3pFLE9BQU8sSUFBSSxtQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ25DO1NBQU07UUFDSCxPQUFPLElBQUksbUJBQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7S0FDL0Q7QUFDTCxDQUFDLENBQUM7QUF0QlcsUUFBQSxrQkFBa0Isc0JBc0I3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZhaWx1cmUsIFJlc3VsdCwgU3VjY2VzcyB9IGZyb20gXCIuLi9leGNlcHRpb25cIjtcbmltcG9ydCBmZXRjaCBmcm9tIFwibm9kZS1mZXRjaFwiO1xuaW1wb3J0IHsgSFRUUFJlc3BvbnNlQm9keSwgU2xhY2tIVFRQR2V0VXNlckluZm9ybWF0aW9uUmVzcG9uc2UgfSBmcm9tIFwiLi4vaHR0cF9yZXF1ZXN0XCI7XG5cbmV4cG9ydCB0eXBlIFNsYWNrUmVzdEFwaUNvbnRleHQgPSB7XG4gICAgcmVzdEFwaUJhc2VVUkw6IHN0cmluZztcbiAgICB0b2tlbjogc3RyaW5nO1xufTtcblxuLy8gZXhwb3J0IHR5cGUgU2xhY2tHZXRVc2VySW5mb3JtYXRpb25SZXF1ZXN0ID0ge1xuLy8gICAgIGR1bW15OnN0cmluZ1xuLy8gfTtcbmV4cG9ydCB0eXBlIFNsYWNrR2V0VXNlckluZm9ybWF0aW9uUmVzcG9uc2UgPSB7XG4gICAgcm9vbUtleTogc3RyaW5nO1xuICAgIHJvb21OYW1lOiBzdHJpbmc7XG4gICAgY2hhbm5lbElkOiBzdHJpbmc7XG4gICAgY2hhbm5lbE5hbWU6IHN0cmluZztcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICB1c2VyTmFtZTogc3RyaW5nO1xuICAgIGltYWdlVXJsOiBzdHJpbmc7XG4gICAgY2hpbWVJbmZvOiB7XG4gICAgICAgIGF0dGVuZGVlTmFtZTogc3RyaW5nO1xuICAgICAgICB1c2VEZWZhdWx0OiBib29sZWFuO1xuICAgIH07XG59O1xuXG4vLyBleHBvcnQgY29uc3QgY3JlYXRlTWVldGluZyA9IGFzeW5jIChjb250ZXh0OiBTbGFja1Jlc3RBcGlDb250ZXh0KTogUHJvbWlzZTxSZXN1bHQ8U2xhY2tHZXRVc2VySW5mb3JtYXRpb25SZXNwb25zZSwgRXJyb3I+PiA9PiB7XG5leHBvcnQgY29uc3QgZ2V0VXNlckluZm9ybWF0aW9uID0gYXN5bmMgKGNvbnRleHQ6IFNsYWNrUmVzdEFwaUNvbnRleHQpOiBQcm9taXNlPFJlc3VsdDxTbGFja0dldFVzZXJJbmZvcm1hdGlvblJlc3BvbnNlLCBFcnJvcj4+ID0+IHtcbiAgICBjb25zdCB1cmwgPSBgJHtjb250ZXh0LnJlc3RBcGlCYXNlVVJMfWFwaS9kZWNvZGVJbmZvcm1hdGlvbmA7XG4gICAgY29uc3QgaHR0cFJlcXVlc3QgPSB7XG4gICAgICAgIHRva2VuOiBgJHtjb250ZXh0LnRva2VufWAsXG4gICAgfTtcbiAgICBjb25zdCByZXF1ZXN0Qm9keSA9IEpTT04uc3RyaW5naWZ5KGh0dHBSZXF1ZXN0KTtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgYm9keTogcmVxdWVzdEJvZHksXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCByZXNwb25zZSA9IChhd2FpdCByZXMuanNvbigpKSBhcyBIVFRQUmVzcG9uc2VCb2R5O1xuICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnN0IGh0dHBSZXNwb25zZSA9IHJlc3BvbnNlLmRhdGEgYXMgU2xhY2tIVFRQR2V0VXNlckluZm9ybWF0aW9uUmVzcG9uc2U7XG4gICAgICAgIGNvbnN0IHJldHVyblZhbHVlOiBTbGFja0dldFVzZXJJbmZvcm1hdGlvblJlc3BvbnNlID0geyAuLi5odHRwUmVzcG9uc2UgfTtcbiAgICAgICAgcmV0dXJuIG5ldyBTdWNjZXNzKHJldHVyblZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IEZhaWx1cmUobmV3IEVycm9yKFwic2xhY2sgZmVkZXJhdGlvbiBmYWlsZWQuLi5cIikpO1xuICAgIH1cbn07XG4iXX0=