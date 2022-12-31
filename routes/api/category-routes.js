const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  // find all categories
  // be sure to include its associated Products
  const inclMod = {include: [{model: Product}]};
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
  try {Category.findAll(inclMod).then((d) => {return rj(d)})} catch (re) {return rj(re)}
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  const {params} = req;
  const inclMod = {include: [{model: Product}]};
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
  try {Category.findByPk(id, inclMod).then((d) => {
      const fd = (d != null);
      switch (true) {
        case (fd):
          return rj(d);
        default:
          return rj('try another id', 400);
      }})} catch (re) {return rj(re)}
});

router.post('/', (req, res) => {
  // create a new category
  const {body} = req;
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
  const cNew = body;
  try {Category.create(cNew).then((d) => {return rj(d)})} catch (re) {return rj(re)}
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  const {params, body} = req;
  const {id} = params;
  const cID = id;
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
  const wID = {where: {id: cID}};
  const cUpdate = body;
  try {Category.update(cUpdate, wID).then((d) => {
    const upD = d.includes(1);
    switch (true) {
      case (upD):
        return rj(d);
      default:
        return rj('try another id or provide another category name', 400);
    }})} catch (re) {return rj(re)}
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  const {params} = req;
  const {id} = params;
  const cID = id;
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
  const wID = {where: {id: cID}};
  try {Category.destroy(wID).then((d) => {
    const ctD = (d != 0);
    switch (true) {
      case (ctD):
        return rj(d);
      default:
        return rj('try another id', 400);
    }})} catch (re) {return rj(re)}
});

module.exports = router;
