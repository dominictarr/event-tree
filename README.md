# event-tree

Hierachical Event Emitters, (rather like in the browser!)

## Usage

events *should* be objects. 

If you emit a non object: `et.emit('thing', 'a string')`
It will be wrapped in an object: `{message: 'a string', source: emitter...}`
This is different to node, but is necessary to keep track of source of an event.

## simple

Emit event on parent after emitting it one the child.

``` js

var EventTree = require('event-tree')

var parent = new EventTree(parent)
var child = new EventTree()

//or: parent.add(child)

parent.on('msg', function (event) {
  console.log(event)
})

child.emit('msg', {message: 'hello!'})

```

output:

```
{event: 'msg', message: 'hello!', source: child, veto: function () {...}}
```

### Veto an event.

if a listener calls veto on the event, it will note be emitted on the parent.

``` js
var EventTree = require('event-tree')

var parent = new EventTree(parent)
var child = new EventTree()

//or: parent.add(child)

parent.on('msg', function (event) {
  throw new Error('This Must Not Happen')
})

child.on('msg', function (event) {
  event.veto()
})

child.emit('msg', {message: 'hello!'})
```

## License

MIT
