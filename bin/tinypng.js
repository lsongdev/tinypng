#!/usr/bin/env node

const Tinypng = require('..');
const parse = require('./parse');

(async ({ _, key, resize, width, height, scale, fit, cover, thumb, help }) => {

  const [ input, output ] = _;

  if(!input || help){
    console.log('');
    console.log(' tinypng <input> <output> [options]');
    console.log('');
    console.log(' --resize <method> <width> <height>');
    console.log(' --scale <width> <height>');
    console.log(' --fit <width> <height>');
    console.log(' --cover <width> <height>');
    console.log(' --thumb <width> <height>');
    console.log(' --help show this message');
    return;
  }

  const tinypng = Tinypng({ key });

  var result;

  try {
    result = await tinypng(input);
  } catch(e) {
    return console.log(`${e.name}:`, e.message);
  }

  if(resize) {
    result = await result.resize(resize, width, height);
  }

  if(scale) {
    result = await result.scale(width, height);
  }

  if(fit) {
    result = await result.fit(width, height);
  }

  if(cover) {
    result = await result.cover(width, height);
  }

  if(thumb) {
    result = await result.thumb(width, height);
  }

  if(output) {
    await result.save(output);
  } else {
    console.log(result.url);
  }

})(parse());