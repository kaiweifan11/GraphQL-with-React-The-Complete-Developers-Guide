import React, { Component } from 'react'; 
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

class LyricList extends Component {
    onLike(id, likes) {
        this.props.mutate({ 
            variables: { id: id },
            // when api is called it takes a while for the likes to be updated
            // we can specify an optimisticResponse to GUESS the reponse
            // so it updates the UI instantaneously 
            optimisticResponse: {
                __typename: 'Mutation',
                // likeLyric can find it in the reponse in the network tab
                likeLyric: {
                    id: id,
                    __typename: 'LyricType',
                    likes: likes + 1
                }
            } 
        })
    }

    renderLyrics() {
        return this.props.lyrics.map(({ id, content, likes } ) =>{
            return (
                <li key={id} className='collection-item'>
                    {content}
                    <div className="vote-box">
                        <i 
                            onClick={()=> this.onLike(id, likes)}
                            className="material-icons"
                        >
                            thumb_up
                        </i>
                        {likes}
                    </div>
                </li>
            );
        });
    }

    render() {
        return (
            <ul className="collection">
                {this.renderLyrics()}
            </ul>
        );
    }
}

const mutation = gql`
    mutation LikeLyric($id: ID) {
        likeLyric(id: $id) {
            id
            likes
        }
    }
`;

export default graphql(mutation)(LyricList);