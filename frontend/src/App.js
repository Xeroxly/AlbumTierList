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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import axios from "axios";

const spotify = new SpotifyWebApi();

// Empty TestData
let blankData = {
  title: "Empty List",
  data: [
    {
      letter: "S",
      albums: [],
    },
    {
      letter: "A",
      albums: [],
    },
    {
      letter: "B",
      albums: [],
    },
    {
      letter: "C",
      albums: [],
    },
    {
      letter: "D",
      albums: [],
    },
  ],
};

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
  const [albumData, setAlbumData] = useState(blankData);
  const [albumIDs, setAlbumIDs] = useState([]);
  const [editTitle, setEditTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");

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

    let albumDataIDs = [];

    albumData.data.forEach((tier) => {
      tier.albums.forEach((album) => {
        albumDataIDs.push(album.id);
      });
    });

    setAlbumIDs(albumDataIDs);
  }, [albumData]);

  // Grab test data
  useEffect(() => {
    async function grabData() {
      // Hardcoded for testing
      const response = await axios.get(
        "http://localhost:5000/tierLists/685d7487895bbd2d0aab0cb7"
      );

      if (response.status === 200) {
        setAlbumData(response.data);
        setEditTitleValue(response.data.title);
      }
    }

    grabData();
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
        let initialResults = result.albums.items;

        // Filters search results to not include albums already in your tier list
        let albumDataIDs = [];

        albumData.data.forEach((tier) => {
          tier.albums.forEach((album) => {
            albumDataIDs.push(album.id);
          });
        });

        setAlbumIDs(albumDataIDs);

        let alreadyHaveAlbum = (album) => {
          if (albumDataIDs.includes(album.id)) {
            return false;
          } else {
            return true;
          }
        };

        let filteredResults = initialResults.filter(alreadyHaveAlbum);

        setSearchResults(filteredResults);
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
        setSearchResults([result]);

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
        <Droppable droppableId={"searchResults"} type="group">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
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

                      // When displaying the tracklist of an album that's already in your tier list, eliminate the double draggable
                      if (
                        searchResults.length === 1 &&
                        albumTracklist.length &&
                        albumIDs.includes(searchResults[0].id)
                      ) {
                        return (
                          <ListItem
                            key={album.id}
                            style={{ backgroundColor: bgcolor }}
                          >
                            <img
                              alt={album.name}
                              src={album.images[0].url}
                              height={"100px"}
                              width={"100px"}
                            />
                            <ListItemText
                              style={{
                                display: "inline",
                                color: "white",
                                paddingLeft: "10px",
                              }}
                            >
                              {album.name}
                            </ListItemText>
                          </ListItem>
                        );
                      } else {
                        return (
                          <ListItem
                            key={album.id}
                            style={{ backgroundColor: bgcolor }}
                          >
                            <Draggable
                              draggableId={album.id}
                              key={album.id}
                              index={i}
                            >
                              {(provided) => (
                                <div
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  <img
                                    alt={album.name}
                                    src={album.images[0].url}
                                    height={"100px"}
                                    width={"100px"}
                                  />
                                </div>
                              )}
                            </Draggable>

                            <button
                              onDoubleClick={(a) => handleAlbumClick(album)}
                              style={{
                                backgroundColor: bgcolor,
                                border: "none",
                                paddingLeft: "15px",
                                cursor: "pointer",
                                paddingBottom: "15px",
                                paddingTop: "0px",
                              }}
                            >
                              <ListItemText
                                style={{
                                  display: "inline",
                                  color: "white",
                                  paddingLeft: "10px",
                                }}
                              >
                                {album.name}
                              </ListItemText>
                            </button>
                            <br />
                          </ListItem>
                        );
                      }
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
                        <ListItem
                          key={song.name}
                          sx={{ backgroundColor: bgcolor }}
                        >
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
          )}
        </Droppable>
      </div>
    );
  };

  // Displays a tier list of albums which can be edited using drag and drop functionality
  let renderTierList = () => {
    return (
      <Box sx={{ flexGrow: 1, p: 2, paddingTop: "3%" }}>
        {editTitle ? (
          <h1>
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              style={{
                borderRadius: "20px",
                border: "2px solid black",
                height: "35px",
                marginLeft: "17%",
                width: "50%",
                paddingLeft: "10px",
                marginTop: "17px",
              }}
            />
            <IconButton
              onClick={() => {
                async function updateData(newData) {
                  const response = await axios.put(
                    "http://localhost:5000/tierLists/" + albumData._id,
                    newData
                  );

                  if (response.status === 200) {
                    setAlbumData(newData);
                    setEditTitle(false);
                  }
                }
                let newData = albumData;
                newData.title = editTitleValue;
                updateData(newData);
              }}
            >
              <SaveIcon sx={{ color: "black", paddingTop: "5px" }} />
            </IconButton>
            <IconButton
              onClick={() => {
                setEditTitle(false);
                setEditTitleValue(albumData.title);
              }}
            >
              <CancelIcon sx={{ color: "black", paddingTop: "5px" }} />
            </IconButton>
          </h1>
        ) : (
          <h1
            style={{
              textDecoration: "underline",
              fontWeight: "bold",
              textAlign: "center",
              marginTop: "35px",
            }}
          >
            {albumData.title}
            <IconButton
              onClick={() => {
                setEditTitle(true);
              }}
            >
              <EditIcon sx={{ color: "black", paddingBottom: "5px" }} />
            </IconButton>
          </h1>
        )}

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
                    {albumData.data
                      .find((tierData) => tierData.letter === row.tierLetter)
                      .albums.map((album, index) => (
                        <Draggable
                          draggableId={album.id}
                          key={album.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              onDoubleClick={(a) => handleAlbumClick(album)}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                            >
                              <img
                                key={album.id}
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

    // If album is dragged and dropped inside the search results, not neccessarily in the same position
    if (
      source.droppableId === "searchResults" &&
      destination.droppableId === "searchResults"
    ) {
      return;
    }

    // If album is dropped back into exact same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // If album is dragged from search results into tier list
    if (
      source.droppableId === "searchResults" &&
      destination.droppableId.length === 1
    ) {
      let updatedSearch = searchResults;

      const [removedAlbum] = updatedSearch.splice(source.index, 1);

      let newTierListAlbum = {
        id: removedAlbum.id,
        title: removedAlbum.name,
        image: removedAlbum.images[0].url,
      };

      setSearchResults(updatedSearch);

      // Accounts for adding an album to tier list while looking at it's tracklist
      if (albumTracklist.length) {
        setSearchResults([removedAlbum]);
      }

      let tierIndex = albumData.data.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let elementToUpdate = albumData.data[tierIndex];

      let reorderedAlbums = albumData.data[tierIndex].albums;
      reorderedAlbums.splice(destination.index, 0, newTierListAlbum);

      let updatedAlbumData = albumData.data.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData({ ...albumData, data: updatedAlbumData });
    }

    // If album is dragged from tier list into search results
    if (
      destination.droppableId === "searchResults" &&
      source.droppableId.length === 1
    ) {
      let tierIndex = albumData.data.findIndex(
        (tier) => tier.letter === source.droppableId
      );

      let elementToUpdate = albumData.data[tierIndex];
      let reorderedAlbums = albumData.data[tierIndex].albums;

      reorderedAlbums.splice(source.index, 1);

      let updatedAlbumData = albumData.data.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData({ ...albumData, data: updatedAlbumData });
    }

    // If album is moved within same tier on the tier list
    if (source.droppableId === destination.droppableId) {
      let tierIndex = albumData.data.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let elementToUpdate = albumData.data[tierIndex];

      let reorderedAlbums = albumData.data[tierIndex].albums;
      const [removedAlbum] = reorderedAlbums.splice(source.index, 1);
      reorderedAlbums.splice(destination.index, 0, removedAlbum);

      let updatedAlbumData = albumData.data.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData({ ...albumData, data: updatedAlbumData });
    }
    // If album is moved between tiers on the tier list
    else {
      let destinationTierIndex = albumData.data.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let sourceTierIndex = albumData.data.findIndex(
        (tier) => tier.letter === source.droppableId
      );

      let destinationElementToUpdate = albumData.data[destinationTierIndex];
      let sourceElementToUpdate = albumData.data[sourceTierIndex];

      let reorderedDestinationAlbums =
        albumData.data[destinationTierIndex].albums;
      let reorderedSourceAlbums = albumData.data[sourceTierIndex].albums;

      const [removedAlbum] = reorderedSourceAlbums.splice(source.index, 1);
      reorderedDestinationAlbums.splice(destination.index, 0, removedAlbum);

      let updatedAlbumData = albumData.data.map((data, index) =>
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

      return setAlbumData({ ...albumData, data: updatedAlbumData });
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
              initialVolume={0.5}
              layout="responsive"
              showSaveIcon="true"
              syncExternalDevice="true"
              hideAttribution="true"
            />
          </AppBar>
          <div className="main">
            <DragDropContext onDragEnd={handleDragDrop}>
              <div style={{ width: "60%" }} className="left">
                {renderTierList()}
              </div>
              <div
                style={{
                  paddingTop: "31px",
                  width: "40%",
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
