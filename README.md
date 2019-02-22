# Iris, the ultimate messenger

---

## Installation for Ubuntu

#### Install Docker

```bash
sudo apt-get update
sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
sudo apt-add-repository 'deb https://apt.dockerproject.org/repo ubuntu-xenial main'
sudo apt-get update
sudo apt-get install -y docker-engine
```

#### Install docker-compose
```bash
sudo pip install docker-compose
```

#### Config
Rename `.env.sample` to `.env` and fill any env vars.

---

## Start the bot

**With logs**
```bash
docker-compose up
```

**Without logs**
```bash
docker-compose up -d
```

---

## Guides

#### Access to AdminMongo
You can access to AdminMongo which permit you to see your mongo database on a GUI.

For accessing to it, go to `localhost:1234` in your navigator and then connect you with `IrisDb` as a connection name and `mongodb://mongo:27017/IrisDb` as a connection string.
