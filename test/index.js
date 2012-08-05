
var EventTree = require('..')
var EventEmitter = require('events').EventEmitter
var a = require('assertions')

var macgyver = require('macgyver')
var tests = 0
function test(n, t) {
  console.log('#', n)
  var mac = macgyver()
  t(mac)
  mac.validate()
  console.log('ok', ++tests)
}


function valid(name, source, owner) {
  if(!owner)
    owner = source
  return function (event) {
    a.strictEqual(this, owner)
    a.has(event, {
      event: name,
      source: a._strictEqual(source),
      veto: a._isFunction(),
      preventDefault: a._isFunction()
    })
  }
}

function noop () {}

test('listener', function (mac) {

  var et = new EventTree()
  a.isInstanceof(et, EventEmitter)
  et.on('hello', mac(valid('hello', et), 'helloListener').once())

  et.emit('hello', {})
})

test('two listeners', function (mac) {
  var et = new EventTree()
  et.on('hello', mac(noop, 'helloListener1').once())
  et.on('hello', mac(noop, 'helloListener2').once())

  et.emit('hello', {})
})

test('pass to parent', function (mac) {
  var et = new EventTree()
  var cet = new EventTree(et)


  et.on('hello',
    mac(noop, 'helloListener - parent').once())
  cet.on('hello', 
    mac(noop, 'helloListener - child').once())

  //the even should be passed to the parent

  cet.emit('hello', {})
})

test('veto pass to parent', function (mac) {
  var et = new EventTree()
  var cet = new EventTree(et)

   et.on('hello',
    mac(noop, 'helloListener - parent').never())
  cet.on('hello', 
    mac(valid('hello', cet), 'helloListener - child').once())
  cet.on('hello',
    mac(function (event) {
      event.veto()
    }, 'helloListener - parent').once())
 
  //the even should be passed to the paren
  cet.emit('hello', {})
})

test('track children', function (mac) {

  var et = new EventTree()
  var cet = new EventTree(et)

  a.equal(et.root, true)

  console.log(et.children)

  a.strictEqual(cet.parent, et)
  a.deepEqual(et.children, [cet])
})

test('remove child stops event propagation', function (mac) {
  var et = new EventTree()
  var cet = new EventTree(et)

   et.on('hello',
    mac(noop, 'helloListener - parent').never())
  cet.on('hello', 
    mac(valid('hello', cet), 'helloListener - child').once())
  cet.on('hello',
    mac(function (event) {
      this.parent.remove(this)
    }, 'helloListener - parent').once())
 
  //the even should be passed to the paren
  cet.emit('hello', {})
})

test('capture newListener event', function (mac) {

  var et = new EventTree()
  
  et.on('newListener', mac(function (event) {
    valid('newListener', et).call(this, event)
    a.equal(event.listener, noop)
  }).once())

  et.on('whatever', noop)

})

test('wrap non object event', function (mac) {

  var et = new EventTree()
  a.isInstanceof(et, EventEmitter)
  et.on('hello', mac(valid('hello', et), 'helloListener').once())
  et.on('hello', mac(function (event) {
    a.equal(event.message, 'string message')
  }, 'helloListener').once())

  et.emit('hello', 'string message')

})
