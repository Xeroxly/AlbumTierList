import { useState, useEffect } from "react";

import SpotifyWebApi from "spotify-web-api-js";
import SpotifyPlayer from "react-spotify-web-playback";
import {
  loginUrl,
  getTokenFromUrl,
  spotifyStyle,
  spotifyPlaybackStyle,
} from "./spotify";

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
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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

let testData = [
  {
    letter: "S",
    albums: [
      {
        id: "7j7lsExGJtBHLgDYzjclwk",
        title: "All Things Must Pass (2014 Remaster)",
        image:
          "https://i.scdn.co/image/ab67616d0000b2736c6610322fc60bfb41481273",
      },
      {
        id: "38xW9kksFyiS5sc0tU082f",
        title: "Brainwashed",
        image:
          "https://i.scdn.co/image/ab67616d0000b273c1afb8febc06f971620d9861",
      },
    ],
  },
  {
    letter: "A",
    albums: [],
  },
  {
    letter: "B",
    albums: [
      {
        id: "7MD06W6wJm7J6jqkBszV22",
        title: "Cloud Nine",
        image:
          "https://i.scdn.co/image/ab67616d0000b27375aeab61b79629d43ca8f42f",
      },
    ],
  },
  {
    letter: "C",
    albums: [],
  },
  {
    letter: "D",
    albums: [],
  },
];

const tierListData = [
  { tierLetter: "S", color: "#FF7F7F" },
  { tierLetter: "A", color: "#FFBF7F" },
  { tierLetter: "B", color: "#FFDF7F" },
  { tierLetter: "C", color: "#FFFF7F" },
  { tierLetter: "D", color: "#BFFF7F" },
];

function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [profileInfo, setProfileInfo] = useState({});
  const [searchCriteria, setSearchCriteria] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [albumTracklist, setAlbumTracklist] = useState({});
  const [currentDevice, setCurrentDevice] = useState("");
  const [albumData, setAlbumData] = useState(testData);

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
    return (
      <Box sx={{ flexGrow: 1, p: 2, paddingTop: "10%" }}>
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
          {tierListData.map((row) => (
            <>
              <Grid
                size={1}
                display="flex"
                alignItems="center"
                justifyContent="space-evenly"
                style={{ backgroundColor: row.color }}
                height="105px"
                width="5%"
              >
                <h3>{row.tierLetter}</h3>
              </Grid>
              <Droppable droppableId={row.tierLetter} type="group">
                {(provided) => (
                  <Grid
                    size={11}
                    display="flex"
                    alignItems="center"
                    height="105px"
                    width="95%"
                    paddingTop="4px"
                    backgroundColor="#333"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {albumData
                      .find((tierData) => tierData.letter === row.tierLetter)
                      .albums.map((album, index) => (
                        <Draggable
                          draggableId={album.id}
                          key={album.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                            >
                              <img
                                src={album.image}
                                alt={album.id}
                                height="100"
                                width="100"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </>
          ))}
        </Grid>
      </Box>
    );
  };

  let handleDragDrop = (results) => {
    const { source, destination } = results;

    // If album is dropped outside of a droppable area
    if (!destination) {
      return;
    }

    // If album is dropped back into exact same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      let tierIndex = albumData.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let elementToUpdate = albumData[tierIndex];

      let reorderedAlbums = albumData[tierIndex].albums;
      const [removedAlbum] = reorderedAlbums.splice(source.index, 1);
      reorderedAlbums.splice(destination.index, 0, removedAlbum);

      let updatedAlbumData = albumData.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData(updatedAlbumData);
    } else {
      let destinationTierIndex = albumData.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let sourceTierIndex = albumData.findIndex(
        (tier) => tier.letter === source.droppableId
      );

      let destinationElementToUpdate = albumData[destinationTierIndex];
      let sourceElementToUpdate = albumData[sourceTierIndex];

      let reorderedDestinationAlbums = albumData[destinationTierIndex].albums;
      let reorderedSourceAlbums = albumData[sourceTierIndex].albums;

      const [removedAlbum] = reorderedSourceAlbums.splice(source.index, 1);
      reorderedDestinationAlbums.splice(destination.index, 0, removedAlbum);

      let updatedAlbumData = albumData.map((data, index) =>
        index === destinationTierIndex
          ? {
              ...destinationElementToUpdate,
              albums: reorderedDestinationAlbums,
            }
          : data
      );

      updatedAlbumData = updatedAlbumData.map((data, index) =>
        index === sourceTierIndex
          ? {
              ...sourceElementToUpdate,
              albums: reorderedSourceAlbums,
            }
          : data
      );

      return setAlbumData(updatedAlbumData);
    }
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
            <DragDropContext onDragEnd={handleDragDrop}>
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
            </DragDropContext>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
