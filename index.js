
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

module.exports = EventTree
inherits(EventTree, EventEmitter)

function EventTree (parent) {
  if(!(this instanceof EventTree))
    return new EventTree(parent)
  if(parent && !(parent instanceof EventEmitter))
    throw new Error('parent must be EventEmitter or null')
  this.children = []
  this.parent = parent
  console.log(parent)
  if(!parent) 
    this.root = true
  else if('function' == typeof parent.add)
    parent.add(this)
}

EventTree.prototype.emit = function (event, obj, listener) {
  var veto = false

  if ('newListener' === event)
    obj = {listener: listener, target: obj}
  else if (!obj || 'object' !== typeof obj)
    obj = {message: obj}

  obj.source = obj.source || this
  obj.veto = obj.preventDefault = function () {
    veto = true 
  }
  obj.event = event

  var r = EventEmitter.prototype.emit.call(this, event, obj)
  if(!veto && this.parent)
    r = this.parent.emit(event, obj)
  return r
}

EventTree.prototype.remove = function (child) {
  if(!child.parent) return
  child.parent = null
  var i
  if(~(i = this.children.indexOf(child)))
    this.children.splice(i, 1)
  return this
}

EventTree.prototype.add = function (child) {
  if(child.parent && child.parent !== this)
    throw new Error('child already has parent')
  child.parent = this
  if(!~this.children.indexOf(child))
    this.children.push(child)
  return this
}


