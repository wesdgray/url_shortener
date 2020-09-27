const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid');
const monk = require('monk');

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

// Setup Monk DB
const db = monk('my_mongo:27017');
const urls = db.get('urls');
urls.createIndex('url');
urls.createIndex('slug');

// Validation of inputs
const schema = yup.object().shape({
  slug: yup.string().trim().matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

// Default Route /
app.get('/', (req,res) => {
  res.json({
    message: 'repond to GET @ /'
  });
});

// Create a url: url: required, slug: optional
app.post('/url', async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      slug = nanoid(5);
    }
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    }
    const slug_exists = await urls.findOne({ slug });
    if (slug_exists) {
      throw new Error('Slug in use');
    }
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    next(error);
  }
});

// retrieve a URL

app.get('/url', async (req, res) => {
  let { slug } = req.body;
  await urls.findOne({slug: slug}).then((doc) => {
    res.json(doc);
  });
});

// Error handling
app.use( (error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: error.stack,
  });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
