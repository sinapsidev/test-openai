const { PollyClient, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand } = require("@aws-sdk/client-polly");
const { S3Client, GetObjectCommand, S3ClientConfig } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const pollyClient = new PollyClient({ region: 'eu-central-1' });
const s3Configuration = { region: 'eu-central-1' };


module.exports.text2speech = async (text) => {
    var params = {
        OutputFormat: "mp3",
        OutputS3BucketName: "snps-otello-speech",
        Text: text,
        TextType: "text",
        VoiceId: "Giorgio",
        SampleRate: "22050",
    };
    let res = await pollyClient.send(new StartSpeechSynthesisTaskCommand(params));

    return res.SynthesisTask.TaskId;
}

module.exports.text2ssml = (text) => {
    let ssml = `<speak>${text}</speak>`;

    ssml = ssml.replace(/\b\d{5,}\b/, "<say-as interpret-as='digits'>$&</say-as>")

    return ssml;
}

module.exports.ssml2speech = async (ssml) => {
    try {
        var params = {
            OutputFormat: "mp3",
            OutputS3BucketName: "snps-otello-speech",
            Text: ssml,
            TextType: "ssml",
            VoiceId: "Giorgio",
            SampleRate: "22050",
        };
        let res = await pollyClient.send(new StartSpeechSynthesisTaskCommand(params));

        return res.SynthesisTask.TaskId;
    }
    catch (e) {
        return
    }
}

module.exports.getSpeech = async (TaskId) => {
    try {
        const command = new GetSpeechSynthesisTaskCommand({ TaskId });
        let res = await pollyClient.send(command);

        if (res.SynthesisTask.TaskStatus === 'completed') {
            const s3 = new S3Client(s3Configuration);
            const command = new GetObjectCommand({ Bucket: 'snps-otello-speech', Key: `${TaskId}.mp3` });
            const url = await getSignedUrl(s3, command, { expiresIn: 15 * 60 });

            return { status: res.SynthesisTask.TaskStatus, speechUrl: url }
        }
        else
            return { status: res.SynthesisTask.TaskStatus }
    }
    catch (e) {
        return { status: 'failed' }
    }
}