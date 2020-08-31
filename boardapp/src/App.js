import React, { Component } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { listPosts } from './graphql/queries';
import { createPost } from './graphql/mutations';
import { onCreatePost } from './graphql/subscriptions';

class App extends Component {

  state = {
    posts: [],
    title: "",
    content: ""
  }


  async componentDidMount() {
    try {
      const posts = await API.graphql(graphqlOperation(listPosts))
      console.log('posts: ', posts)
    } catch (e) {
      console.log(e)
    }
    
    API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (eventData) => {
        console.log('eventData: ', eventData)
        const post = eventData.value.data.onCreatePost
        const posts = [...this.state.posts.filter(content => {
          return (content.title !== post.title)
        }), post]
        this.setState({ posts })
      }
    })
  
  
  }

  createPost = async () => {
    // バリデーションチェック
    if (this.state.title === '' || this.state.content === '') return

    // 新規登録 mutation
    const createPostInput = {
      title: this.state.title,
      content: this.state.content
    }

    // 登録処理
    try {
      const posts = [...this.state.posts, createPostInput]
      this.setState({ posts: posts, title: "", content: "" })
      await API.graphql(graphqlOperation(createPost, { input: createPostInput }))
      console.log('createPostInput: ', createPostInput)
    } catch (e) {
      console.log(e)
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }


  render() {
    return (
      <div className="App">
      {this.state.posts.map((post,idx) => {return <div key={idx} class="comment">
        <div class="title">件名：{post.title}</div>
        <div>{post.content}</div>
      </div>})}
      <div class="input-form">
            <div>
              件名：<input value={this.state.title} name="title" onChange={this.onChange}></input>
            </div>
            <div>
              <textarea onChange={this.onChange} name="content" cols="50" rows="10">{this.state.content}</textarea>
            </div>
            <button onClick={this.createPost}>書き込む</button>
          </div>
        </div>
    )
  }
}

export default App;