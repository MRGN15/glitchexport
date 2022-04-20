const { App, ExpressReceiver } = require("@slack/bolt");

// Create a Bolt Receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Create the Bolt App, using the receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

const fetch = require("node-fetch");
const express = require("express");
receiver.router.use(express.json());

//////////////////////////////

receiver.router.get("/test", async (req, res) => {
  console.log(req.body);
  res.status(200).json({"challenge": `${req.body.challenge}`});
});

//////////////////////////////


app.event('app_mention', async ({ event, context, client, say }) => {
  try {
    await say({"blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Thanks for the mention <@${event.user}>!`
        },
      }
    ]});
  }
  catch (error) {
    console.error(error);
  }
});

//Fetch testing
app.action("tw_fetch", async ({ ack, body, client, payload, context }) => {
  await ack();
  console.log("Fetch button click.");
  
  try {
    
    await client.chat.postMessage({
      channel: body.user.id,
      text: "You clicked my button!"
    });
      
   // await fetch(
   //    `https://mr-boto.azurewebsites.net`,
   //    {
   //      method: "GET",
   //      headers: {
   //        "Content-Type": "application/json",
   //        // Authorization: "Bearer " + process.env.TW_NEW_TOKEN,
   //      },
   //      // body: JSON.stringify({
   //      //     "todo-item": {
   //      //       "due-date":"20220422",
   //      //         }
   //      //     }),
   //        }
   //      )
   //      .then((res) => console.log(res))
   //      // .then((json) => {
   //      //   console.log(json);
   //      // });
 
  } catch (error) {
    console.error(error);
  }
});

//Home Tab
app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        callback_id: "home_view",
        blocks: [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: "Fetch",
                },
                style: "primary",
                value: "tw_click_fetch",
                action_id: "tw_fetch",
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});



//////////////////////////////

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
