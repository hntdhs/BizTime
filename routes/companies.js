const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const db = require("../db")

let router = new express.Router();

router.get("/", async function (req, res, next){
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );
        return res.json({"companies": result.rows});
    }
    catch(err) {
        return next(err);
    }
});

router.get("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const compResult = await db.query(
            `SELECT code, name, description
             FROM companies AS c
             WHERE code = $1`,
          [code]
      );

      const industries = await db.query(
        `SELECT code, industry
        FROM industries_of_companies 
        LEFT JOIN industries ON ind_code = code
             WHERE comp_code = $1`, 
        [code]
      )

      const invResult = await db.query(
        `SELECT id
         FROM invoices
         WHERE comp_code = $1`,
      [code]
    //   don't understand what invoices have to do with anything the exercise is asking for with this route
    // need to ask for further explanation of how the $1 works against SQL injections - here the 'code' tells the db which company we want, but what does the $1 do?
  );

  if (compResult.rows.length === 0) {
    throw new ExpressError(`No such company: ${code}`, 404)
  }

  const company = compResult.rows[0];
  const invoices = invResult.rows;

  company.invoices = invoices.map(inv => inv.id);
  company.industries = industries;

  return res.json({"company": company});
}

catch (err) {
  return next(err);
}
});

router.post("/", async function (req, res, next) {
    try {
      let {name, description} = req.body;
      let code = slugify(name, {lower: true});
  
      const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3) 
             RETURNING code, name, description`,
          [code, name, description]);
  
      return res.status(201).json({"company": result.rows[0]});
    //   why is it rows[0]? does a new company always get inserted into the first row?
    }
  
    catch (err) {
      return next(err);
    }
  });

  router.post("/:companyCode/:industryCode", async function (req, res, next) {
    let companyCode = req.params.companyCode;
    let industryCode = req.params.industryCode;

    await db.query(
      `INSERT INTO industries_of_companies VALUES (
        $1, $2
      )`, [companyCode, industryCode]
    )
    return res.status(201);
  
  });

  router.delete("/:companyCode/:industryCode", async function (req, res, next) {
    let companyCode = req.params.companyCode;
    let industryCode = req.params.industryCode;

    await db.query(
     `DELETE FROM industries_of_companies WHERE  comp_code=$1 AND ind_code=$2 `, [companyCode, industryCode]
    )
    return res.status(204);
  })

  router.put("/:code", async function (req, res, next) {
    try {
      let {name, description} = req.body;
      let code = req.params.code;
    //   not sure what the difference between this and slugify is
  
      const result = await db.query(
            `UPDATE companies
             SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
          [name, description, code]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({"company": result.rows[0]});
      }
    }
  
    catch (err) {
      return next(err);
    }
  
  });


router.delete("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const result = await db.query(
            `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
          [code]);
  
      if (result.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({"status": "deleted"});
      }
    }
  
    catch (err) {
      return next(err);
    }
  });
  
  
  module.exports = router;