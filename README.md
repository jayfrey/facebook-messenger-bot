# Facebook Messenger Bot

### Tech Stack
* Node.js
* Express.js
* MySQL
* Ngrok
* Mailgun

### Installation
Navigate to the app folder in terminal and run the following commands in sequence.
```sh
cd facebook-messenger-bot
```

### Update environment variables
Copy **.sample.env** and name it as **.env**. Update all environment variables except for **APP_URL**, **PORT**, **NODE_ENV**, which are optional for development.
```sh
cp .sample.env .env
```

### Setup for a Facebook page
You will need to setup for a Facebook page and developer account to acquire **Page ID**, **Page Access Token**, **APP ID** and **APP Secret**. As for **VERIFY_TOKEN**, it can be a random string and will be used to verify webhook.

### Register for a Mailgun account
Register for a Mailgun account and activate it. Copy your mailgun API token and domain to both **MAILGUN_API_TOKEN** and **MAILGUN_DOMAIN** respectively. Do make sure to authorize the recipient otherwise, mailgun won't send. Can visit [here](https://help.mailgun.com/hc/en-us/articles/217531258) for more information.

### Register for a Ngrok account 
Register for a Ngrok account and supply it to **NGROK_AUTHTOKEN** in docker-compose.yml

### Startup the application stack
```sh
docker-compose up
```
Run the following command to monitor the services health to ensure they are all healthy, usually takes less than a minute.
```sh
docker ps
```

### Migrate tables and seed product data
Once all the services are healthy. Run the following command to migrate the necessary tables and seed the product data.
```sh
docker-compose run api yarn sequelize-cli db:migrate
docker-compose run api yarn sequelize-cli db:seed:all
```

### Get the hosted URL
Click [here](http://localhost:4040/) to open the application and you will be presented with the hosted url.

### Verify Facebook webhook
Copy the hosted url and add the /webhook path as your callback url for webhook, for instance, https://70c2-175-141-86-30.ap.ngrok.io/webhook and verify with the random string from **VERIFY_TOKEN**

### Instruction for query product details
To query product details, user can type "/<Query Type> <Product ID/SKU>", for instance, "/desc ". The following is the list of query types:
* desc
* price
* shipping
* sku
* name
* type
* upc
* manufacturer
* model
* url
