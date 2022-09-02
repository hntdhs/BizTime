const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db")

let router = new express.Router();

router.get("/", async function (req, res, next){
    try {
        const result = await db.query(
            // `SELECT code, industry
            // FROM industries
            // LEFT JOIN industries_of_companies ON code = comp_code
            // ORDER BY industry`
            `SELECT i.code, i.industry, ic.comp_code
            FROM industries AS i
            LEFT JOIN industries_of_companies AS ic ON code = comp_code
            ORDER BY industry
            `
        );
        return res.json({"industries": result.rows});
    }
    catch(err) {
        return next(err);
    }
});
// not sure about this
router.get("/:id", async function (req, res, next) {
    try {
      const result = await db.query(
            `SELECT m.id, m.msg, t.tag
               FROM messages AS m
                 LEFT JOIN messages_tags AS mt 
                   ON m.id = mt.message_id
                 LEFT JOIN tags AS t ON mt.tag_code = t.code
               WHERE m.id = $1;`,
          [req.params.id]);
  
      let { id, msg } = result.rows[0];
      let tags = result.rows.map(r => r.tag);
  
      return res.json({ id, msg, tags });
    }
  
    catch (err) {
      return next(err);


const industries = await db.query(
    `SELECT code, industry
    FROM industries_of_companies 
    LEFT JOIN industries ON ind_code = code
         WHERE comp_code = $1`, 
    [code]