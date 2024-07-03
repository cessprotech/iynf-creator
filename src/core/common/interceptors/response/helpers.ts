import { IMongoError } from '@core/common/interfaces';
import { Error } from 'mongoose';

// DUPLICATE ERROR (MORE THAN ONE VALUE)
export const handleDuplicateErrorDB = (err: IMongoError) => {
  const errorKeys = Object.keys(err.keyValue);
  return `${errorKeys[0]}: ${
    err.keyValue[errorKeys[0]]
  } already exist. Please use another value`;
};

// CAST ERROR (INVALID VALUE)
export const handleCastErrorDB = (err: IMongoError) => {
  const messages: string[] = [];

  Object.keys(err.errors).forEach((val) =>
    messages.push(`Invalid ${err.errors[val].path} - ${err.errors[val].value}`),
  );

  return messages.join('. ');
};

// VALIDATION ERROR (VALUE DOESN'T MATCH EXPECTED VALUE)
export const handleValidationErrorDB = (err: IMongoError) => {
  const errorKeys = Object.keys(err.errors).map(el => {
    const split = el.split('.');
    split.pop();

    for (let s = 0; s < split.length; s++) {
      split[s] = split[s].capitalize();
    } 
    return split.join(' ');
    
  })
  const errors = Object.values(err.errors).map((el, i) => {
      return `${errorKeys[i]} ${el.message}`
  });

  return `Invalid Input Data: ${errors.join('. ').replace(/"/g, `'`)}`;
};

// CAST ERROR (INVALID VALUE)
export const handleCastObjectId = (err: Error.CastError) => {
  return `Invalid ${err.path} - ${err.value}`;
};
