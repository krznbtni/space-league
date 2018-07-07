const Mint = require('../models/mint.model');

// Create.
exports.mint_create = (req, res) => {
  let mint = new Mint({
    blockNumber: req.body.blockNumber,
    player: req.body.player,
    status: req.body.status
  });

  mint.save((err) => {
    if (err) {
      return next(err);
    }
    
    res.send('Mint created.');
  });
};

// Read all.
exports.mint_all_details = res => {
  Mint.find((err, mints) => {
    if (err) {
      return next(err);
    }

    res.send(mints);
  });
};

// Read specific.
exports.mint_details = (req, res) => {
  Mint.findById(req.params.id, (err, mint) => {
    if (err) {
      return next(err);
    }

    res.send(mint);
  });
};

// Update.
exports.mint_update = (req, res) => {
  Mint.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, mint) => {
    if (err) {
      return next(err);
    }

    res.send('Mint updated: ' + req.params.id);
  });
};

// Delete.
exports.mint_delete = (req, res) => {
  Mint.findByIdAndRemove(req.params.id, err => {
    if (err) {
      return next(err);
    }

    res.send('Mint deleted: ' + req.params.id);
  });
};
