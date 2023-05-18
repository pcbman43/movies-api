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

```
openssl x509 -text -noout -in certificate.pem
```

Source - https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl

## For 'Sign In With Google' to work, a Google API client ID will have to be assigned to the GOOGLE_CLIENT_ID variable in the '.env' file

Open the Credentials page of the [Google APIs console](https://console.developers.google.com/apis).

Create or select a Google APIs project.

Click Create credentials > OAuth client ID to create a client ID. Be sure to include both https://localhost and https://localhost:4000 in the Authorized JavaScript origins box.

Source - https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## Starting the app
```
npm start
```
