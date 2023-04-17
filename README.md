
# BeReal Clone

A week-long mini project replicating the popular app BeReal.

This project utilizes both this [repository](https://github.com/washedBrownBoy/berealclone) and my [BeReal](https://github.com/washedBrownBoy/bereal) repository. The front-end is built on a React Native framework designed for both iOS and Android while the backend is hosted through an Express.js app. 
## Features

- Upload images from front and back camera
- All data stored securely through Firebase Auth and Database
- Cross platform


## Environment Variables

To run this project, you will need to add the following environment variables to your express.js .env file

| Name |  Description                |
| :-------- | :------------------------- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase Admin Credentials  |
| `COSMICBUCKETSLUG` | Name of Cosmic bucket to use in application  |
| `COSMICREADKEY` | Cosmic API key to read to bucket  |
| `COSMICWRITEKEY` | Cosmic API key to write to bucket  |
| `WEBAPIKEY` |  Google Firebase Web App API key  |

## Tech Stack

**Client:** React Native

**Server:** Node, Express

**Storage:** Firebase, Cosmic


## Demo


### Send friend request
https://cdn.discordapp.com/attachments/579783583376343063/1097400674108588082/addfriend.gif

### Sign in and accept friend request
https://cdn.discordapp.com/attachments/579783583376343063/1097400673592692827/signinandaccept.gif

### Post BeReal
https://cdn.discordapp.com/attachments/579783583376343063/1097400675152973844/postnotempty.gif


## Things to Do

* Add create user functionality
* Add edit profile functionality
* Add emotes/comments to BeReals
* Add captions to BeReals
* Add page to view BeReal along with emotes/comments
