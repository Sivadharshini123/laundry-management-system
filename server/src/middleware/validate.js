export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid URL parameters',
        details: err.errors ? err.errors.map(e => e.message) : err.message
      });
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: err.errors ? err.errors.map(e => e.message) : err.message
      });
    }
  };
}
