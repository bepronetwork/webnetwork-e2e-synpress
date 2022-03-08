# webnetwork e2e

## Steps to running locally

### First we need to create a file called "SYNPRESS_PRIVATEKEY" and place the test wallet's private key. This is because the synpress lib doesn't recognize the .env
### after that we will run the command which will instantiate the variables locally on our machine so that synpress will recognize
```
sourcer synpress_envsetter.sh
``` 

### After all these steps, just install the packages and run the command:
```
npm run test:e2e
``` 
