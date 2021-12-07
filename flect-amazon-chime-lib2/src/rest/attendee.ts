import { RestApiClientContext } from "./RestApiClient";
import { GetAttendeeInfoResponse, JoinMeetingRequest, JoinMeetingResponse, ResponseBody } from "../backend_const";
export { JoinMeetingRequest };
export const joinMeeting = async (params: JoinMeetingRequest, context: RestApiClientContext): Promise<JoinMeetingResponse> => {
    const url = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    params.meetingName = encodeURIComponent(params.meetingName);
    params.attendeeName = encodeURIComponent(params.attendeeName);
    const requestBody = JSON.stringify(params);

    const res = await fetch(url, {
        method: "POST",
        body: requestBody,
        headers: {
            Authorization: context.idToken!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Flect-Access-Token": context.accessToken!,
        },
    });

    const response = (await res.json()) as ResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as JoinMeetingResponse;
    return data;
};

/**
 * get attendee name
 */
export type GetUserNameByAttendeeIdRequest = {
    meetingName: string;
    attendeeId: string;
};

export const getUserNameByAttendeeId = async (params: GetUserNameByAttendeeIdRequest, context: RestApiClientContext): Promise<GetAttendeeInfoResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees/${encodeURIComponent(params.attendeeId)}`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    const response = (await res.json()) as ResponseBody;
    if (response.success === false) {
        console.log(response.code);
        throw response.code;
    }
    const data = response.data as GetAttendeeInfoResponse;
    return data;
};

/**
 * List attendees *** maybe return attendee history. not current attendee???***
 */
export type GetAttendeeListRequest = {
    meetingName: string;
};
export type GetAttendeeListResponse = {
    attendees: [
        {
            ExternalUserId: string;
            AttendeeId: string;
            JoinToken: string;
        }
    ];
    result: string;
};

export const getAttendeeList = async (params: GetAttendeeListRequest, context: RestApiClientContext): Promise<GetAttendeeListResponse> => {
    const attendeeUrl = `${context.baseUrl}meetings/${encodeURIComponent(params.meetingName)}/attendees`;
    const res = await fetch(attendeeUrl, {
        method: "GET",
        headers: {
            Authorization: context.idToken!,
            "X-Flect-Access-Token": context.accessToken!,
        },
    });
    if (!res.ok) {
        throw new Error("Invalid server response");
    }

    const data = await res.json();
    return {
        attendees: data.Attendees,
        result: data.result,
    };
};
