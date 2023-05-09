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

## For HTTPS to work, the '.env' file must be setup with the paths of a private key file and a .crt file

https://www.ibm.com/docs/en/api-connect/2018.x?topic=overview-generating-self-signed-certificate-using-openssl

## For 'Sign In With Google' to work, a Google API client ID will have to be assigned to the GOOGLE_CLIENT_ID variable in the '.env' file

https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid

## Starting the app
```
npm start
```
