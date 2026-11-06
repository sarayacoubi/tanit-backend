
exports.IsAdmin = async(req, res, next) => {

  try {
  
   if(req.body.role != 'admin'){
    return res.status(400).send({errors : [{msg: "Not authoried"}]})
   
   }

    next();

   }
  
  catch (error) {
    res.status(500).send({ errors: [{ msg: "Not authorized" }] });
  }
};

