const tinypng = require('..')({
  key: 'hQLkKTFtPq82pR5RL2yFPvKz01DX2FBR'
});

(async () => {
  
  const output = await tinypng('/tmp/input.png');
  console.log(output.url);
  await output.save('/tmp/output.png');
  // resize - fit
  const fit = await output.fit(150, 100);
  await fit.save('/tmp/output-fit.png');

})();