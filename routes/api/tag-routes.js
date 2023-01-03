const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  const inclMod = {include: [{model: Product}]};
  const rs = (n) => {return res.status(n)};
  const rj = (r, n) => {
    switch (true) {
      case (!n):
        return res.json(r);
      default:
        rs(n);
        return res.json(r);
    }};
  try {Tag.findAll(inclMod).then((d) => {return rj(d)})} catch (re) {return rj(re)}
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
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
    }};
  const {id} = params;
  try {
    Tag.findByPk(id, inclMod).then((d) => {
      const fd = (d != null);
      switch (true) {
        case (fd):
          return rj(d);
        default:
          return rj('try another id', 400);
      }})} catch (re) {return rj(re)}
});

router.post('/', async (req, res) => {
  // create a new tag
  const {body} = req;
  const {productIds} = body;
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
  //    {
  //      "tag_name": "",
  //      "productIds": []
  //    }
  const tNew = body;
  try {
    const prodIds = productIds;
    const idPT = (!prodIds || !prodIds.length);
    // given productIds
    switch (true) {
      case (idPT):
        // Tag create
        const tc = await Tag.create(tNew);
        const tgId = tc.get({plain: true});
        const msg = {note: 'productIds were not provided'};
        return rj(Object.assign(tgId, msg));
      default:
        // productIds
        const prodIdsLen = prodIds.length;
        let ptID = [];
        for (let i = 0; i < prodIdsLen; i++) {
          const idProd = {product_id: prodIds[i]};
          ptID = [...ptID, idProd]};
        // Tag create
        const tgC = await Tag.create(tNew);
        // product tag
        let ptTags = [];
        const tID = tgC.id;
        const createPT = (len) => {
          for (let i = 0; i < len; i++) {
            const idTag = {tag_id: tID};
            ptTags = [...ptTags, Object.assign(idTag, ptID[i])];
          } return [...ptTags]};
        // ProductTag bulkCreate
        const ptB = await ProductTag.bulkCreate(createPT(prodIdsLen));
        return rj(ptB);
    }} catch (re) {return rj(re)}
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  const {params, body} = req;
  const {id} = params;
  const tagId = id;
  const wTg = {where: {id: tagId}};
  const wPdTg = {where: {tag_id: tagId}};
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
  try {
    const fd = await Tag.findByPk(id)
    if (!fd) {
      return rj('try another id', 400);
    };
    const tUpdate = body;
    const {productIds} = body;
    const prodIds = productIds;
    const idPT = (!prodIds || !prodIds.length);
    // given productIds 
    if (idPT) {
      let updMg = [];
      // tag_name
      // Tag update
      const tUp = await Tag.update(tUpdate, wTg);
      const msg = {note: 'productIds were not provided'};
      return rj([...updMg, tUp, msg]);
    } else {
      // Tag update
      const tgUp = await Tag.update(tUpdate, wTg);
      // productIds 
      let ptID = [];
      const prodIdsLen = prodIds.length;
      for (let i = 0; i < prodIdsLen; i++) {
        const idProd = {product_id: prodIds[i]};
        ptID = [...ptID, idProd];
      };
      
      // ProductTag findAll
      const ptAll = await ProductTag.findAll(wPdTg);
      
      // id(s) 
      let cPtTg = [];
      // given ProductTag findAll
      switch (true) {
        case (!ptAll):
          const ptCreate = (len) => {
            for (let i = 0; i < len; i++) {
              const idTag = {tag_id: tagId};
              cPtTg = [...cPtTg, Object.assign(idTag, ptID[i])]
            }; return [...cPtTg]};
          // ProductTag bulkCreate
          return ProductTag.bulkCreate(ptCreate(prodIdsLen)).then((d) => {return rj(d)});
        default:
          let prodID = [];
          let tgID = [];
          let pTgID = [];
          for (let i = 0; i < ptAll.length; i++) {
            pTgID = [...pTgID, ptAll[i].id];
            tgID = [...tgID, ptAll[i].tag_id];
            prodID = [...prodID, ptAll[i].product_id];}
          
          // delete
          let desPtID = [];
          let rmPtID = [];
          const wID = (len) => {
            for (let i = 0; i < len; i++) {
              if (prodIds.indexOf(prodID[i]) != -1) {
                rmPtID = [...rmPtID, pTgID[i]];
              } else {
                desPtID = [...desPtID, pTgID[i]];}
            } return {where: {id: [...desPtID]}};};
          
          await ProductTag.destroy(wID(ptAll.length));
          
          // product id
          let ptIDN = [];
          let ptIDE = [];
          for (let i = 0; i < prodIdsLen; i++) {
            if (prodID.indexOf(prodIds[i]) != -1) {
              const egID = {product_id: prodIds[i]};
              ptIDE = [...ptIDE, egID];
            } else {
              const idPt = {product_id: prodIds[i]};
              ptIDN = [...ptIDN, idPt];}};
          const createPT = (len) => {
            for (let i = 0; i < len; i++) {
              const idTg = {tag_id: tagId}
              cPtTg = [...cPtTg, Object.assign(idTg, ptIDN[i])];
            }; return [...cPtTg]};
          // ProductTag bulkCreate
          const d = await ProductTag.bulkCreate(createPT(ptIDN.length));
          if (!d.length) {
            return rj(tgUp);}
          rj(d)}}} catch (re) {return rj(re)}
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  const {params} = req;
  const {id} = params;
  const tgID = id;
  const rs = (n) => {return res.status(n)};
  const rj = (r, n) => {
    switch (true) {
      case (!n):
        return res.json(r);
      default:
        rs(n);
        return res.json(r);
    }};
  const wID = {where: {id: tgID}};
  try {
    Tag.destroy(wID).then((d) => {
      const tgD = (d != 0);
      switch (true) {
        case (tgD):
          return rj(d);
        default:
          return rj('try another id', 400);
      }})} catch (re) {return rj(re)}
});

module.exports = router;
