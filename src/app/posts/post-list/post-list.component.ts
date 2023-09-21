import { Component, OnDestroy, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
    // posts = [
    //     {
    //         title: 'First Post',
    //         content: 'This is my first post!'
    //     },
    //     {
    //         title: 'Second Post',
    //         content: 'This is my second post!'
    //     },
    //     {
    //         title: 'Third Post',
    //         content: 'This is my third post!'
    //     },
    // ];
    posts: Post[] = [];
    private postSub: Subscription
    isLoading:boolean = false;
    constructor(public postService: PostsService, private http: HttpClient) {}

    ngOnInit(): void {
        this.isLoading = true;
        this.postService.getPosts();
        this.postSub = this.postService.getPostUpdatedListener().subscribe((posts: Post[]) => {
            this.isLoading = false;
            this.posts = posts;
        })
    }

    onDelete(postId: String) {
        this.postService.deletePost(postId);
    }

    ngOnDestroy(): void {
        this.postSub.unsubscribe();
    }
}