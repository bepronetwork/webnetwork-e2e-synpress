# webnetwork e2e

## Steps to running locally

### First we need to create a file called "SYNPRESS_PRIVATEKEY" and place the test wallet's private key. This is because the synpress lib doesn't recognize the .env

### Now we need to start the BeproService, to use some ganache services
### For this we will add the private_key and hostname to the .env and start the server with the command:
```
npm run beproService
``` 

### After that we will run the command which will instantiate the variables locally on our machine so that synpress will recognize
```
source synpress_envsetter.sh
``` 

### After all these steps, just install the packages and run the command:
```
npm run test:e2e
``` 
