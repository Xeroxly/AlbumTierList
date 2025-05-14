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
  Grid,
  InputAdornment,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
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
// Improved search page's visuals
// Playback transfers to webpage before song play
// Need to implement right half/left half layout with tier list and album search respectively

// TO DO:
// Need to add tier list creation/editing functionality
// Need to add ability to save tier lists to Database
// Need to add ability to search for other user's tier lists and display them
// Need to add ability for login to persist accross refreshses
// Need to impove look of the non-logged in page

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [profileInfo, setProfileInfo] = useState({});
  const [searchCriteria, setSearchCriteria] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [albumTracklist, setAlbumTracklist] = useState({});
  const [currentDevice, setCurrentDevice] = useState("");

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

  let handleSubmitSearch = (e) => {
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

  let makeCurrentDeviceActive = () => {
    spotify.getMyDevices((err, result) => {
      if (err) {
        console.log(err);
      } else {
        let myAppID = result.devices.find(
          (device) => device.name === "Spotify Web Player"
        );

        setCurrentDevice(myAppID.id);
        let deviceIdObject = [myAppID.id];
        spotify.transferMyPlayback(deviceIdObject);
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

        // On clicking on an album, set current device as playback device. Only runs once
        if (!currentDevice) {
          makeCurrentDeviceActive();
        }
      }
    });
  };

  let handleSongPlay = (song) => {
    spotify.queue(song.uri, () => {
      spotify.skipToNext();
    });
  };

  // allows the user to search spotify for albums and displays those results, also allows those albums's tracklist to be shown and played
  let renderAlbumSearch = () => {
    let albumListPadding = searchResults.length === 1 ? "0px" : "27px";
    let trackListPadding = albumTracklist.length === 1 ? "0px" : "27px";

    return (
      <div style={{ backgroundColor: "#333" }}>
        <form
          onSubmit={handleSubmitSearch}
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
          <IconButton
            sx={{
              marginTop: "10px",
            }}
            onClick={handleSubmitSearch}
          >
            <SearchIcon sx={{ color: "white" }} />
          </IconButton>
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
              sx={{
                width: "100%",
                paddingTop: "0px",
                paddingBottom: trackListPadding,
              }}
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

  let renderTierList = () => {
    const tierListData = [
      { tierLetter: "S", color: "#FF7F7F" },
      { tierLetter: "A", color: "#FFBF7F" },
      { tierLetter: "B", color: "#FFDF7F" },
      { tierLetter: "C", color: "#FFFF7F" },
      { tierLetter: "D", color: "#BFFF7F" },
    ];

    return (
      <Box sx={{ flexGrow: 1, p: 2, paddingTop: "12%" }}>
        <Grid
          container
          sx={{
            "--Grid-borderWidth": "3px",
            borderTop: "var(--Grid-borderWidth) solid",
            borderLeft: "var(--Grid-borderWidth) solid",
            borderColor: "black",
            "& > div": {
              borderRight: "var(--Grid-borderWidth) solid",
              borderBottom: "var(--Grid-borderWidth) solid",
              borderColor: "black",
            },
          }}
        >
          {tierListData.map((row) => {
            return (
              <>
                <Grid
                  size={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-evenly"
                  style={{ backgroundColor: row.color }}
                  height="100px"
                  width="5%"
                >
                  <h2>{row.tierLetter}</h2>
                </Grid>
                <Grid
                  size={11}
                  display="flex"
                  alignItems="center"
                  height="100px"
                  width="95%"
                  backgroundColor="#333"
                >
                  <div style={{ paddingLeft: "10px" }}>albums</div>
                </Grid>
              </>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <div style={{ margin: "-8px" }}>
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
          <div className="main">
            <div style={{ width: "50%" }} className="left">
              {renderTierList()}
            </div>
            <div
              style={{
                paddingTop: "31px",
                width: "50%",
                borderLeft: "3px solid black",
              }}
              className="right"
            >
              {renderAlbumSearch()}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
