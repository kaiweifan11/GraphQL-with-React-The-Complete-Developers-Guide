import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';
import query from '../queries/fetchSongs';

class SongList extends Component {
    onSongDelete(id) {
        this.props.mutate({ variables: { id } }).then(()=> 
            // another way to refetch
            // this only works when we already have query in the provider and has a refetch function
            // as opposed to SongCreate where the props do not have a refetch function
            this.props.data.refetch()
        ); 
    }

    renderSongs() {
        return this.props.data.songs.map(({id, title}) => {
            return (
                <li key={id} className="collection-item" >
                    <Link to={`/songs/${id}`}>{title}</Link>
                    <i 
                        className='material-icons'
                        onClick={() => this.onSongDelete(id)}
                    >
                        delete
                    </i>
                </li>
            )
        })
    }

    render() {
        //console.log(this.props);

        if(this.props.data.loading) return <div>Loading...</div>
        return(
            <div>
                <ul className="collection">
                    {this.renderSongs()}
                </ul>
                <Link 
                    to="/songs/new"
                    className="btn-floating btn-large red right"
                >
                    <i className="material-icons">add</i>
                </Link>
            </div>
            
        )
    }
}

// const query = gql`
//     {
//         songs {
//             id
//             title
//         }
//     }
// `;


const mutation = gql`
    mutation DeleteSong($id: ID) {
        deleteSong(id: $id) {
            id
        }
    }
`;

export default graphql(mutation)(
    graphql(query)(SongList)
);