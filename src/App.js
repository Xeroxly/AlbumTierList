import SpotifyWebApi from "spotify-web-api-js";
import SpotifyPlayer from "react-spotify-web-playback";

import { useState, useEffect } from "react";
import {
  loginUrl,
  getTokenFromUrl,
  spotifyStyle,
  spotifyPlaybackStyle,
} from "./spotify";

const spotify = new SpotifyWebApi();

// DONE:
// Added Spotify Authentication
// Added in app playback controls
// Need ability to search for songs/albums/artists and display the results
// Make search results clickable and onclick display tracklist with ability to play those songs

// TO DO:
// Need to add tier list creation/editing functionality
// Need to impove look of the page

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [profileInfo, setProfileInfo] = useState({});
  const [searchCriteria, setSearchCriteria] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [albumTracklist, setAlbumTracklist] = useState({});

  useEffect(() => {
    // API call to get Authorization Token from Spotify
    const _spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = "";

    if (_spotifyToken) {
      setSpotifyToken(_spotifyToken);
      spotify.setAccessToken(_spotifyToken);
      spotify.getMe().then((user) => {
        setProfileInfo(user);
      });
    }
  }, []);

  // Renders info from the currently logged in account
  let renderProfile = () => {
    if (JSON.stringify(profileInfo) !== "{}") {
      return (
        <div>
          <div style={{ display: "inline" }}>
            <a
              style={spotifyStyle}
              href={"http://localhost:3000/"}
              id="signInButton"
            >
              Sign Out
            </a>
          </div>
          <h2 style={{ display: "inline" }}>
            Signed in as: {profileInfo.display_name}
            {"  "}
          </h2>
          <img
            src={profileInfo.images[0].url}
            alt="profilePic"
            style={{ height: "100px", width: "100px" }}
          />
        </div>
      );
    } else {
      return (
        <div>
          <a style={spotifyStyle} href={loginUrl} id="signInButton">
            Sign in with Spotify
          </a>
        </div>
      );
    }
  };

  // allows the user to search spotify for albums and displays those results, also allows those albums's tracklist to be shown and played
  // NEEDS BREAKUP INTO MULTIPLE FUNCTIONS (ORGANIZATION)
  let renderAlbumSearch = () => {
    let handleSubmit = (e) => {
      e.preventDefault();
      spotify.searchAlbums(searchCriteria, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          setSearchResults(result.albums.items);
          setAlbumTracklist({});
        }
      });
    };

    let handleAlbumClick = (album) => {
      spotify.getAlbum(album.id, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          setAlbumTracklist(result.tracks.items);
          setSearchResults({});
        }
      });
    };

    let handleSongPlay = (song) => {
      spotify.queue(song.uri, () => {
        spotify.skipToNext();
      });
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <label>Search for an Album: </label>
          <input
            type="text"
            value={searchCriteria}
            onChange={(e) => setSearchCriteria(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <br />
        <div>
          {searchResults.length
            ? searchResults.map((album) => {
                return (
                  <div key={album.id}>
                    <input
                      type="image"
                      alt={album.name}
                      src={album.images[0].url}
                      height={"150px"}
                      width={"150px"}
                      onClick={(e, a) => handleAlbumClick(album)}
                    />
                    {"  "}
                    <h2 style={{ display: "inline" }}>{album.name}</h2>
                    <br />
                  </div>
                );
              })
            : null}
          {albumTracklist.length
            ? albumTracklist.map((song) => {
                return (
                  <div key={song.name}>
                    <h3 style={{ display: "inline" }}>{song.name} </h3>
                    <button onClick={(s) => handleSongPlay(song)}>Play</button>
                    <br />
                  </div>
                );
              })
            : null}
        </div>
      </div>
    );
  };
  //   return topArtistData.map((artist, index) => {
  //     return (
  //       <div key={artist.name}>
  //         <h2>
  //           {index + 1}. {artist.name}
  //         </h2>
  //         <img
  //           src={artist.images[0].url}
  //           alt={artist.name}
  //           height="200px"
  //           width="200px"
  //         />
  //         <div>
  //           Followers:{" "}
  //           {Intl.NumberFormat("en-US").format(artist.followers.total)}
  //         </div>
  //         <br />
  //       </div>
  //     );
  //   });
  // };

  return (
    <div>
      <br />
      {renderProfile()}
      <br />
      {spotifyToken ? (
        <div>
          <SpotifyPlayer
            token={spotifyToken}
            styles={spotifyPlaybackStyle}
            initialVolume={0.25}
            layout="responsive"
            showSaveIcon="true"
            syncExternalDevice="true"
            autoPlay="true"
            hideAttribution="true"
          />
          <br />
          {renderAlbumSearch()}
        </div>
      ) : null}
    </div>
  );
}

export default App;
