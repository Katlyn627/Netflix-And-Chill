# AWS Deployment Guide

This guide covers deploying Netflix and Chill to AWS using various services.

## Option 1: AWS Elastic Beanstalk (Recommended for Beginners)

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- EB CLI installed

### Installation

Install EB CLI:
```bash
pip install awsebcli
```

### Deployment Steps

1. **Initialize Elastic Beanstalk**
   ```bash
   eb init
   ```
   
   Follow the prompts:
   - Select your region
   - Create a new application or select existing
   - Select Node.js platform
   - Set up SSH (optional)

2. **Create Environment**
   ```bash
   eb create netflix-and-chill-env
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv TMDB_API_KEY=your_api_key
   eb setenv DB_TYPE=file
   eb setenv NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

5. **Open Application**
   ```bash
   eb open
   ```

### Using RDS (PostgreSQL)

1. **Create RDS Instance**
   ```bash
   # Create PostgreSQL database
   aws rds create-db-instance \
     --db-instance-identifier netflix-chill-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password yourpassword \
     --allocated-storage 20
   ```

2. **Set Environment Variables**
   ```bash
   eb setenv DB_TYPE=postgresql
   eb setenv PG_HOST=your-rds-endpoint.amazonaws.com
   eb setenv PG_DATABASE=postgres
   eb setenv PG_USER=admin
   eb setenv PG_PASSWORD=yourpassword
   eb setenv PG_PORT=5432
   ```

### Using DocumentDB (MongoDB Compatible)

1. **Create DocumentDB Cluster**
   ```bash
   aws docdb create-db-cluster \
     --db-cluster-identifier netflix-chill-cluster \
     --engine docdb \
     --master-username admin \
     --master-user-password yourpassword
   ```

2. **Set Environment Variables**
   ```bash
   eb setenv DB_TYPE=mongodb
   eb setenv MONGODB_URI="mongodb://admin:password@cluster-endpoint:27017/netflix-and-chill?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
   ```

## Option 2: AWS EC2 (More Control)

### 1. Launch EC2 Instance

```bash
# Create security group
aws ec2 create-security-group \
  --group-name netflix-chill-sg \
  --description "Security group for Netflix and Chill"

# Allow HTTP traffic
aws ec2 authorize-security-group-ingress \
  --group-name netflix-chill-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS traffic
aws ec2 authorize-security-group-ingress \
  --group-name netflix-chill-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Launch instance (Ubuntu 22.04)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t2.micro \
  --key-name your-key-pair \
  --security-groups netflix-chill-sg
```

### 2. Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 3. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install git
sudo apt install -y git

# Clone repository
git clone https://github.com/Katlyn627/Netflix-And-Chill.git
cd Netflix-And-Chill

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2

# Create environment file
cat > .env << EOF
PORT=80
TMDB_API_KEY=your_api_key
DB_TYPE=file
NODE_ENV=production
EOF

# Start application with PM2
sudo pm2 start backend/server.js --name netflix-chill
sudo pm2 startup
sudo pm2 save
```

### 4. Setup Nginx (Optional - for reverse proxy)

```bash
sudo apt install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/netflix-chill << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/netflix-chill /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Option 3: AWS Lambda + API Gateway (Serverless)

For serverless deployment, you'll need to modify the application to work with Lambda.

### Prerequisites
```bash
npm install -g serverless
npm install --save-dev serverless-http
```

### Create serverless.yml

```yaml
service: netflix-and-chill

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    TMDB_API_KEY: ${env:TMDB_API_KEY}
    DB_TYPE: ${env:DB_TYPE}
    MONGODB_URI: ${env:MONGODB_URI}

functions:
  app:
    handler: backend/lambda.handler
    events:
      - http:
          path: /
          method: ANY
      - http:
          path: /{proxy+}
          method: ANY

plugins:
  - serverless-offline
```

### Deploy
```bash
serverless deploy
```

## S3 + CloudFront (Static Frontend)

For better performance, serve frontend from S3 + CloudFront:

```bash
# Create S3 bucket
aws s3 mb s3://netflix-chill-frontend

# Upload frontend files
aws s3 sync frontend/ s3://netflix-chill-frontend/ --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name netflix-chill-frontend.s3.amazonaws.com
```

## Cost Estimation

- **Elastic Beanstalk (t2.micro)**: ~$10-15/month
- **EC2 (t2.micro)**: ~$8-10/month (Free tier: 750 hours/month for 12 months)
- **RDS (db.t3.micro)**: ~$15-20/month (Free tier: 750 hours/month for 12 months)
- **Lambda**: Pay per request (very low for small apps)

## Monitoring

Enable CloudWatch:
```bash
# View logs
eb logs

# Or for EC2
sudo pm2 logs
```

## Auto Scaling (Elastic Beanstalk)

Configure in `.ebextensions/autoscaling.config`:
```yaml
option_settings:
  aws:autoscaling:asg:
    MinSize: 1
    MaxSize: 4
  aws:autoscaling:trigger:
    MeasureName: CPUUtilization
    Statistic: Average
    Unit: Percent
    UpperThreshold: 70
    LowerThreshold: 20
```

## Backup Strategy

- **RDS**: Enable automated backups
- **File Storage**: Use S3 for data persistence

## Security Best Practices

1. Use AWS Secrets Manager for sensitive data
2. Enable HTTPS with ACM (AWS Certificate Manager)
3. Use VPC for database isolation
4. Enable CloudWatch logs
5. Use IAM roles instead of access keys

## Resources

- [AWS Elastic Beanstalk Node.js](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
