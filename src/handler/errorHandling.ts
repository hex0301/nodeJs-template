import Joi, { ValidationError } from "joi"

interface error {
        Status : Number,
        Title : String,
        Description : String
}

let errorResponse : error = {
  Status : 0,
  Title : "",
  Description : ""
}


export const errorSignupHandling = (err : ValidationError ) => {
  console.log(err)
  if(err.details[0].message.includes('password'))
    {
      errorResponse.Title = ""
      errorResponse.Description = 'Password must unique.';
      errorResponse.Status = 401;
    }
  else if(err.details[0].message.includes('email')){
      errorResponse.Title = ""
      errorResponse.Description = 'Please enter valid email.';
      errorResponse.Status = 401;
  }
return errorResponse
}