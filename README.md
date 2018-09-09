# data-model-layer
Simple entity model system in JavaScript

Data model layer allows you to structure your data into model instances: Basically just objects of a certain type, but *related* to each other and connected to a backend *service*. That allows for modelling usual CRUD entities of arbitrary complexity.

## So how does it work?
DML provides a base model to your project that can be extended by your own models. That provides them with some neat functionality to set, modify and delete your data, based on the assumption you can group it into entities of a specific type. As soon as you change any property on your models, the data service will be activated to propagate that change to whatever storage backend you use.  
Services must extend the base Service class (in lieu of actual interface implementations in Javascript, it just defines an API to work against). They can connect to everything, really - whether that's a fetch API service connecting to a remote REST API, GraphQL or localStorage. DML ships with a few: A LocalService that holds all data in-memory, a RemoteService that maps to HTTP calls and an IndexedDbService that translates to the in-browser indexedDb database.  
The neat thing about this is modularization: All complexity is abstracted into the right places. Models have the sole responsibility of storing, modifying and transforming data. Services receive a fixed set of CRUD calls and persist data. Consumers don't need to worry about any of that: They just use ordinary objects with some convenience methods on them.

## Features
DML provides a bunch of cool functionality:
 - **Typed object model:** Model instances are a clean, object-oriented implementation of data types. They represent a single entity in your data structure, complete with known properties, type completion and inheritance.
 - **Automatic relationships:** Any model can contain references to other types (Many comments belong to one post) that are automatically updated. They are retrieved lazily and defined via runtime.
 - **Simple API:** If you've ever seen Larvel's Eloquent models, you'll immediately know how things work. The API is mostly self-explaining, behaving exactly as you'd expect.

## Model structure
Let's take a look at a basic model:

```js
import UserService from '../services/UserService';
import PostModel from './Post';

class User extends Model {
  static get _service() {
    return UserService;
  }
  
  constructor() {
    this.relate(Post)
  }
}
```

Now that we've defined the user model and attached our service to it, let's see how to use it:

```js
import User from '../models/User';
import Post from '../models/Post';

// Fetch all users
const users = await User.all();

// Fetch all active users
const activeUsers = await Users.where('active', 1);

// Fetch user 2315
const myUser = await User.find(2315);

// Update a user
myUser.firstName = 'Bruce';
myUser.lastName = 'Dickinson';

// Fetch posts by this user
const myUsersPosts = await Post.where('user', myUser.id); // length: 43

const newPost = new Post({ title: 'Foo', content: 'Bar baz', created: new Date() })
myUser.with(newPost);

newPost.save();

const myUsersPosts = await Post.where('user', myUser.id); // length: 44
```
