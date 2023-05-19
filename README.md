# Movies
## Prerequisites
Clone down this repository. You will need `node` and `npm` installed globally on your machine.

## Dependencies installation:
```
npm install
```

## Create .env
```
cp .env.sample .env
```

## For HTTPS to work, a private key and certificate file must be generated

### For this, openssl must be installed and configured on your machine.

```
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem
```

Source - https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl

## For 'Sign In With Google' to work, a Google API client ID will have to be assigned to the GOOGLE_CLIENT_ID variable in the '.env' file

1. Open the Credentials page of the [Google APIs console](https://console.developers.google.com/apis).

2. Create or select a Google APIs project.

3. Click `Create credentials` > `OAuth client ID` to create a client ID. Include both https://localhost and https://localhost:4000 in the Authorized JavaScript origins box.

4. Copy your Client ID and paste it into the .env file, next to the GOOGLE_CLIENT_ID variable, enclosed in apostrophes (' ').
<br>
**The line should look like this:**
```
GOOGLE_CLIENT_ID='1234567890-abc123def456.apps.googleusercontent.com'
```

Source - https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## Starting the app
```
npm start
```
