import SpotifyWebApi from "spotify-web-api-js";
import SpotifyPlayer from "react-spotify-web-playback";
import {
  AppBar,
  Avatar,
  Box,
  FormControl,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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
// Need ability to search for albums and display the results
// Make search results clickable and onclick display tracklist with ability to play those songs

// TO DO:
// Need to add tier list creation/editing functionality
// Need to add ability to save tier lists to Database
// Need to add ability to search for other user's tier lists and display them
// Need to add ability for login to persist accross refreshses
// Need to impove look of the non-logged in page
// Need to implement right half/left half layout with tier list and album search respectively

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
        <AppBar style={{ backgroundColor: "black" }}>
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              style={{ paddingRight: "10px" }}
            >
              Signed in as: {profileInfo.display_name}
            </Typography>
            <Avatar
              src={profileInfo.images[0].url}
              alt="profilePic"
              sx={{ width: 60, height: 60, margin: 0.5 }}
            />
            <Box sx={{ flexGrow: 2 }} />
            <a
              style={spotifyStyle}
              href={"http://localhost:3000/"}
              id="signInButton"
            >
              Sign Out
            </a>
          </Toolbar>
        </AppBar>
      );
    } else {
      // Not logged in page needs work visually
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
          setSearchResults([album]);
        }
      });
    };

    let handleSongPlay = (song) => {
      spotify.queue(song.uri, () => {
        spotify.skipToNext();
      });
    };

    let albumListPadding = searchResults.length === 1 ? "0px" : "80px";

    return (
      <div>
        <form
          onSubmit={handleSubmit}
          style={{ outline: "3px solid black", outlineOffset: "15px" }}
        >
          <FormControl
            sx={{
              width: "50%",
              paddingLeft: "25%",
              paddingTop: "15px",
            }}
          >
            <input
              type="text"
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
              placeholder="Search for an Album"
              style={{
                borderRadius: "20px",
                paddingLeft: "10px",
                border: "2px solid black",
                height: "25px",
              }}
            />
          </FormControl>
        </form>
        <br />
        <div>
          {searchResults.length ? (
            <List
              sx={{
                width: "100%",
                paddingTop: "0px",
                paddingBottom: albumListPadding,
              }}
            >
              {searchResults.map((album, i) => {
                let bgcolor = i % 2 === 0 ? "#444" : "#333";
                return (
                  <ListItem key={album.id} style={{ backgroundColor: bgcolor }}>
                    <input
                      type="image"
                      alt={album.name}
                      src={album.images[0].url}
                      height={"100px"}
                      width={"100px"}
                      onClick={(a) => handleAlbumClick(album)}
                    />
                    {"  "}
                    <ListItemText
                      style={{
                        display: "inline",
                        color: "white",
                        paddingLeft: "10px",
                      }}
                    >
                      {album.name}
                    </ListItemText>
                    <br />
                  </ListItem>
                );
              })}
            </List>
          ) : null}
          {albumTracklist.length ? (
            <List
              sx={{ width: "100%", paddingTop: "0px", paddingBottom: "80px" }}
            >
              {albumTracklist.map((song, i) => {
                let bgcolor = i % 2 === 0 ? "#333" : "#444";
                return (
                  <ListItem key={song.name} sx={{ backgroundColor: bgcolor }}>
                    <ListItemText sx={{ color: "white" }}>
                      {i + 1}. {song.name}{" "}
                    </ListItemText>
                    <IconButton onClick={(s) => handleSongPlay(song)}>
                      <PlayArrowIcon sx={{ color: "white" }} />
                    </IconButton>
                  </ListItem>
                );
              })}
            </List>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#333", margin: "-8px" }}>
      <br />
      {renderProfile()}
      <br />
      {spotifyToken ? (
        <div>
          <AppBar position="fixed" sx={{ top: "auto", bottom: 0 }}>
            <SpotifyPlayer
              token={spotifyToken}
              styles={spotifyPlaybackStyle}
              initialVolume={0.25}
              layout="responsive"
              showSaveIcon="true"
              syncExternalDevice="true"
              hideAttribution="true"
            />
          </AppBar>
          <br />
          <br />
          {renderAlbumSearch()}
        </div>
      ) : null}
    </div>
  );
}

export default App;
