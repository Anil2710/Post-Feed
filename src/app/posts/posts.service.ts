import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Subject, map } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})

export class PostsService {
    private posts: Post[] = [];
    private postUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts() {
        this.http.get<{message: String, posts: Post[]}>('http://localhost:3000/api/posts')
        .pipe(map((postData) => {
            return postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    id: post.id,
                    imagePath: post.imagePath
                };
            });
        }))
        .subscribe((transformedPosts) => {
            this.posts = transformedPosts;
            this.postUpdated.next([...this.posts]);
        })
    }

    getPostUpdatedListener() {
        return this.postUpdated.asObservable();
    }

    onAddPosts(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
        .subscribe((responseData) => {
            // console.log(responseData.message);  
            const post: Post = {id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath};          
            this.posts.push(post);
            this.postUpdated.next([...this.posts]);
            this.router.navigate(['/']);
        });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post |FormData;
        if(typeof image === "object") {
            postData = new FormData();
            postData.append("id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        } else {
            postData = {
                id: id, 
                title: title, 
                content: content, 
                imagePath: image
            };
        }
        this.http.put("http://localhost:3000/api/posts/" + id, postData)
        .subscribe((response) => {
            // console.log(response);
            const updatedPosts = [...this.posts];
            const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
            const post: Post = {
                id: id, 
                title: title, 
                content: content, 
                imagePath: ""
            }
            updatedPosts[oldPostIndex] = post;
            this.posts = updatedPosts;
            this.postUpdated.next([...this.posts]);
            this.router.navigate(['/']);
        });
    }

    deletePost(postId: String) {
        this.http.delete("http://localhost:3000/api/posts/" + postId)
        .subscribe(() => {
            // console.log('Deleted !');
            const updatedPosts =  this.posts.filter(post => post.id !== postId);
            this.posts = updatedPosts;
            this.postUpdated.next([...this.posts]);
        });
    }

    getPost(id: string) {
        return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(
            "http://localhost:3000/api/posts/" + id
        );
    }
}