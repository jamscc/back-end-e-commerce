const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  const inclMod = {include: [{model: Category}, {model: Tag}]};
  const rs = (n) => {return res.status(n)};
  const rj = (r, n) => {
    switch (true) {
      case (!n):
        return res.json(r);
      default:
        rs(n);
        return res.json(r);
    }
  };
  try {Product.findAll(inclMod).then((d) => {return rj(d)})} catch (re) {return rj(re)}
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  const {params} = req;
  const inclMod = {include: [{model: Category}, {model: Tag}]};
  const rs = (n) => {return res.status(n)};
  const rj = (r, n) => {
    switch (true) {
      case (!n):
        return res.json(r);
      default:
        rs(n);
        return res.json(r);
    }
  };
  const {id} = params;
  try {Product.findByPk(id, inclMod).then((d) => {
    const fd = (d != null);
    switch (true) {
      case (fd):
        return rj(d);
      default:
        return rj('try another id', 400);
    }})} catch (re) {return rj(re)}
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  const {params} = req;
  const {id} = params;
  const ptID = id;
  const rs = (n) => {return res.status(n)};
  const rj = (r, n) => {
    switch (true) {
      case (!n):
        return res.json(r);
      default:
        rs(n);
        return res.json(r);
    }
  };
  const wID = {where: {id: ptID}};
  try {Product.destroy(wID).then((d) => {
    const ptD = (d != 0);
    switch (true) {
      case (ptD):
        return rj(d);
      default:
        return rj('try another id', 400);
    }})} catch (re) {return rj(re)}
});

module.exports = router;
