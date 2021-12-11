"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailFromAccessToken = exports.generateResponse = exports.getExpireDate = exports.getResponseTemplate = void 0;
const aws_sdk_1 = require("aws-sdk");
const rest_1 = require("./federation/rest");
const provider = new aws_sdk_1.CognitoIdentityServiceProvider();
const getResponseTemplate = () => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        body: "{}",
        isBase64Encoded: false,
    };
    return response;
};
exports.getResponseTemplate = getResponseTemplate;
const getExpireDate = () => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * 24;
};
exports.getExpireDate = getExpireDate;
const generateResponse = (body) => {
    var response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
        isBase64Encoded: false,
    };
    return response;
};
exports.generateResponse = generateResponse;
const getEmailFromAccessToken = async (accessToken) => {
    const tokens = accessToken.split(",");
    if (tokens.length === 1) {
        const p = new Promise((resolve, reject) => {
            provider.getUser({ AccessToken: tokens[0] }, (err, data) => {
                // console.log(err);
                if (err) {
                    console.log("[getEmailFromAccessToken] token is not cognito accessToken");
                    reject("[getEmailFromAccessToken] token is not cognito accessToken");
                }
                console.log(data);
                resolve(data);
            });
        });
        const userData = await p;
        let email;
        let foundEmail = false;
        for (let i = 0; i < userData.UserAttributes.length; i++) {
            const att = userData.UserAttributes[i];
            if (att["Name"] == "email") {
                email = att["Value"];
                foundEmail = true;
            }
        }
        if (foundEmail) {
            return email;
        }
        else {
            console.log("email not found");
            throw "email not found";
        }
    }
    else if (tokens.length === 2) {
        if (tokens[0] === "slack") {
            const getUSerInformationResult = await (0, rest_1.getUserInformation)({
                restApiBaseURL: "https://slack-chime-connect.herokuapp.com/",
                token: tokens[1],
            });
            if (getUSerInformationResult.isFailure()) {
                throw "invalid token!! fail to fetch";
            }
            console.log(getUSerInformationResult.value);
            return getUSerInformationResult.value.userId;
        }
        else {
            console.log(`unknown provider ${tokens[0]}`);
            throw `unknown provider ${tokens[0]}`;
        }
    }
    else {
        console.log("this token format is not supported");
        throw "this token format is not supported";
    }
};
exports.getEmailFromAccessToken = getEmailFromAccessToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xhbWJkYTIvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBeUQ7QUFFekQsNENBQXVEO0FBRXZELE1BQU0sUUFBUSxHQUFHLElBQUksd0NBQThCLEVBQUUsQ0FBQztBQUUvQyxNQUFNLG1CQUFtQixHQUFHLEdBQUcsRUFBRTtJQUNwQyxJQUFJLFFBQVEsR0FBRztRQUNYLFVBQVUsRUFBRSxHQUFHO1FBQ2YsT0FBTyxFQUFFO1lBQ0wsOEJBQThCLEVBQUUsc0VBQXNFO1lBQ3RHLDhCQUE4QixFQUFFLEdBQUc7WUFDbkMsNkJBQTZCLEVBQUUsR0FBRztTQUNyQztRQUNELElBQUksRUFBRSxJQUFJO1FBQ1YsZUFBZSxFQUFFLEtBQUs7S0FDekIsQ0FBQztJQUNGLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUMsQ0FBQztBQVpXLFFBQUEsbUJBQW1CLHVCQVk5QjtBQUVLLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3hELENBQUMsQ0FBQztBQUZXLFFBQUEsYUFBYSxpQkFFeEI7QUFFSyxNQUFNLGdCQUFnQixHQUFHLENBQUMsSUFBc0IsRUFBRSxFQUFFO0lBQ3ZELElBQUksUUFBUSxHQUFHO1FBQ1gsVUFBVSxFQUFFLEdBQUc7UUFDZixPQUFPLEVBQUU7WUFDTCw4QkFBOEIsRUFBRSxzRUFBc0U7WUFDdEcsOEJBQThCLEVBQUUsR0FBRztZQUNuQyw2QkFBNkIsRUFBRSxHQUFHO1NBQ3JDO1FBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQzFCLGVBQWUsRUFBRSxLQUFLO0tBQ3pCLENBQUM7SUFDRixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFaVyxRQUFBLGdCQUFnQixvQkFZM0I7QUFFSyxNQUFNLHVCQUF1QixHQUFHLEtBQUssRUFBRSxXQUFtQixFQUFFLEVBQUU7SUFDakUsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFpRCxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0RixRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUN2RCxvQkFBb0I7Z0JBQ3BCLElBQUksR0FBRyxFQUFFO29CQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsNERBQTRELENBQUMsQ0FBQztvQkFDMUUsTUFBTSxDQUFDLDREQUE0RCxDQUFDLENBQUM7aUJBQ3hFO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxLQUFLLENBQUM7UUFDVixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxFQUFFO2dCQUN4QixLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQixVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQ3JCO1NBQ0o7UUFDRCxJQUFJLFVBQVUsRUFBRTtZQUNaLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsTUFBTSxpQkFBaUIsQ0FBQztTQUMzQjtLQUNKO1NBQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM1QixJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDdkIsTUFBTSx3QkFBd0IsR0FBRyxNQUFNLElBQUEseUJBQWtCLEVBQUM7Z0JBQ3RELGNBQWMsRUFBRSw0Q0FBNEM7Z0JBQzVELEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQztZQUNILElBQUksd0JBQXdCLENBQUMsU0FBUyxFQUFFLEVBQUU7Z0JBQ3RDLE1BQU0sK0JBQStCLENBQUM7YUFDekM7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sd0JBQXdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztTQUNoRDthQUFNO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3QyxNQUFNLG9CQUFvQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUN6QztLQUNKO1NBQU07UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDbEQsTUFBTSxvQ0FBb0MsQ0FBQztLQUM5QztBQUNMLENBQUMsQ0FBQztBQWpEVyxRQUFBLHVCQUF1QiwyQkFpRGxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29nbml0b0lkZW50aXR5U2VydmljZVByb3ZpZGVyIH0gZnJvbSBcImF3cy1zZGtcIjtcbmltcG9ydCB7IEhUVFBSZXNwb25zZUJvZHkgfSBmcm9tIFwiLi9odHRwX3JlcXVlc3RcIjtcbmltcG9ydCB7IGdldFVzZXJJbmZvcm1hdGlvbiB9IGZyb20gXCIuL2ZlZGVyYXRpb24vcmVzdFwiO1xuXG5jb25zdCBwcm92aWRlciA9IG5ldyBDb2duaXRvSWRlbnRpdHlTZXJ2aWNlUHJvdmlkZXIoKTtcblxuZXhwb3J0IGNvbnN0IGdldFJlc3BvbnNlVGVtcGxhdGUgPSAoKSA9PiB7XG4gICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiBcIkNvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuXCIsXG4gICAgICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIjogXCIqXCIsXG4gICAgICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBcIipcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogXCJ7fVwiLFxuICAgICAgICBpc0Jhc2U2NEVuY29kZWQ6IGZhbHNlLFxuICAgIH07XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEV4cGlyZURhdGUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApICsgNjAgKiA2MCAqIDI0O1xufTtcblxuZXhwb3J0IGNvbnN0IGdlbmVyYXRlUmVzcG9uc2UgPSAoYm9keTogSFRUUFJlc3BvbnNlQm9keSkgPT4ge1xuICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIjogXCJDb250ZW50LVR5cGUsWC1BbXotRGF0ZSxBdXRob3JpemF0aW9uLFgtQXBpLUtleSxYLUFtei1TZWN1cml0eS1Ub2tlblwiLFxuICAgICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzXCI6IFwiKlwiLFxuICAgICAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogXCIqXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgICAgICBpc0Jhc2U2NEVuY29kZWQ6IGZhbHNlLFxuICAgIH07XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEVtYWlsRnJvbUFjY2Vzc1Rva2VuID0gYXN5bmMgKGFjY2Vzc1Rva2VuOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB0b2tlbnMgPSBhY2Nlc3NUb2tlbi5zcGxpdChcIixcIik7XG4gICAgaWYgKHRva2Vucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlPENvZ25pdG9JZGVudGl0eVNlcnZpY2VQcm92aWRlci5HZXRVc2VyUmVzcG9uc2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHByb3ZpZGVyLmdldFVzZXIoeyBBY2Nlc3NUb2tlbjogdG9rZW5zWzBdIH0sIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJbZ2V0RW1haWxGcm9tQWNjZXNzVG9rZW5dIHRva2VuIGlzIG5vdCBjb2duaXRvIGFjY2Vzc1Rva2VuXCIpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJbZ2V0RW1haWxGcm9tQWNjZXNzVG9rZW5dIHRva2VuIGlzIG5vdCBjb2duaXRvIGFjY2Vzc1Rva2VuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGF3YWl0IHA7XG4gICAgICAgIGxldCBlbWFpbDtcbiAgICAgICAgbGV0IGZvdW5kRW1haWwgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1c2VyRGF0YS5Vc2VyQXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYXR0ID0gdXNlckRhdGEuVXNlckF0dHJpYnV0ZXNbaV07XG4gICAgICAgICAgICBpZiAoYXR0W1wiTmFtZVwiXSA9PSBcImVtYWlsXCIpIHtcbiAgICAgICAgICAgICAgICBlbWFpbCA9IGF0dFtcIlZhbHVlXCJdO1xuICAgICAgICAgICAgICAgIGZvdW5kRW1haWwgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChmb3VuZEVtYWlsKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1haWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImVtYWlsIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgICAgIHRocm93IFwiZW1haWwgbm90IGZvdW5kXCI7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRva2Vucy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaWYgKHRva2Vuc1swXSA9PT0gXCJzbGFja1wiKSB7XG4gICAgICAgICAgICBjb25zdCBnZXRVU2VySW5mb3JtYXRpb25SZXN1bHQgPSBhd2FpdCBnZXRVc2VySW5mb3JtYXRpb24oe1xuICAgICAgICAgICAgICAgIHJlc3RBcGlCYXNlVVJMOiBcImh0dHBzOi8vc2xhY2stY2hpbWUtY29ubmVjdC5oZXJva3VhcHAuY29tL1wiLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0b2tlbnNbMV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChnZXRVU2VySW5mb3JtYXRpb25SZXN1bHQuaXNGYWlsdXJlKCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBcImludmFsaWQgdG9rZW4hISBmYWlsIHRvIGZldGNoXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnZXRVU2VySW5mb3JtYXRpb25SZXN1bHQudmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIGdldFVTZXJJbmZvcm1hdGlvblJlc3VsdC52YWx1ZS51c2VySWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgdW5rbm93biBwcm92aWRlciAke3Rva2Vuc1swXX1gKTtcbiAgICAgICAgICAgIHRocm93IGB1bmtub3duIHByb3ZpZGVyICR7dG9rZW5zWzBdfWA7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInRoaXMgdG9rZW4gZm9ybWF0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIHRocm93IFwidGhpcyB0b2tlbiBmb3JtYXQgaXMgbm90IHN1cHBvcnRlZFwiO1xuICAgIH1cbn07XG4iXX0=