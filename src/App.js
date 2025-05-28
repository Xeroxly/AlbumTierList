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
// Search Results are filtered based on current tier list to avoid duplicates
// Need to add tier list creation/editing functionality

// TO DO:
// Need to add ability to save tier lists to Database
// Need to add ability to search for other user's tier lists and display them
// Need to add ability for login to persist accross refreshses
// Need to impove look of the non-logged in page (maybe add tutorial?)
// Add abiity for other users to comment on people's tier lists

// Populated Test Data
// let testData = [
//   {
//     letter: "S",
//     albums: [
//       {
//         id: "0ETFjACtuP2ADo6LFhL6HN",
//         title: "Abbey Road (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25",
//       },
//       {
//         id: "6QaVfG1pHYl1z15ZxkvVDW",
//         title: "Sgt. Pepper's Lonely Hearts Club Band (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b27334ef8f7d06cf2fc2146f420a",
//       },
//       {
//         id: "1klALx0u4AavZNEvC4LrTL",
//         title: "The Beatles (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b2734ce8b4e42588bf18182a1ad2",
//       },
//       {
//         id: "50o7kf2wLwVmOTVYJOTplm",
//         title: "Rubber Soul (Remastered 2009)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273ed801e58a9ababdea6ac7ce4",
//       },
//       {
//         id: "3PRoXYsngSwjEQWR5PsHWR",
//         title: "Revolver (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b27328b8b9b46428896e6491e97a",
//       },
//     ],
//   },
//   {
//     letter: "A",
//     albums: [
//       {
//         id: "0jTGHV5xqHPvEcwL8f6YU5",
//         title: "Let It Be (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b27384243a01af3c77b56fe01ab1",
//       },
//       {
//         id: "2BtE7qm1qzM80p9vLSiXkj",
//         title: "Magical Mystery Tour (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273692d9189b2bd75525893f0c1",
//       },
//     ],
//   },
//   {
//     letter: "B",
//     albums: [
//       {
//         id: "3KzAvEXcqJKBF97HrXwlgf",
//         title: "Please Please Me (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273dbeec63ad914c973e75c24df",
//       },
//       {
//         id: "0PT5m6hwPRrpBwIHVnvbFX",
//         title: "Help! (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273e3e3b64cea45265469d4cafa",
//       },
//     ],
//   },
//   {
//     letter: "C",
//     albums: [
//       {
//         id: "6wCttLq0ADzkPgtRnUihLV",
//         title: "A Hard Day's Night (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273e230f303815e82a86713eedd",
//       },
//       {
//         id: "1vANZV20H5B4Fk6yf7Ot9a",
//         title: "Beatles For Sale (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b27355612ece447bec5d62c68375",
//       },
//       {
//         id: "1aYdiJk6XKeHWGO3FzHHTr",
//         title: "With The Beatles (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273608a63ad5b18e99da94a3f73",
//       },
//     ],
//   },
//   {
//     letter: "D",
//     albums: [
//       {
//         id: "1gKZ5A1ndFqbcrWtW85cCy",
//         title: "Yellow Submarine (Remastered)",
//         image:
//           "https://i.scdn.co/image/ab67616d0000b273d283808926ad3d2220e63c1c",
//       },
//     ],
//   },
// ];

// Empty TestData
let testData = [
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
        let initialResults = result.albums.items;

        // Filters search results to not include albums already in your tier list
        let albumDataIDs = [];

        albumData.forEach((tier) => {
          tier.albums.forEach((album) => {
            albumDataIDs.push(album.id);
          });
        });

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

      let tierIndex = albumData.findIndex(
        (tier) => tier.letter === destination.droppableId
      );

      let elementToUpdate = albumData[tierIndex];

      let reorderedAlbums = albumData[tierIndex].albums;
      reorderedAlbums.splice(destination.index, 0, newTierListAlbum);

      let updatedAlbumData = albumData.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData(updatedAlbumData);
    }

    // If album is dragged from tier list into search results
    if (
      destination.droppableId === "searchResults" &&
      source.droppableId.length === 1
    ) {
      let tierIndex = albumData.findIndex(
        (tier) => tier.letter === source.droppableId
      );

      let elementToUpdate = albumData[tierIndex];
      let reorderedAlbums = albumData[tierIndex].albums;

      reorderedAlbums.splice(source.index, 1);

      let updatedAlbumData = albumData.map((data, index) =>
        index === tierIndex
          ? { ...elementToUpdate, albums: reorderedAlbums }
          : data
      );

      return setAlbumData(updatedAlbumData);
    }

    // If album is moved within same tier on the tier list
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
    }
    // If album is moved between tiers on the tier list
    else {
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
