export const authEndpoint = "https://accounts.spotify.com/authorize";

const clientId = "21c6488625cc4b0b87e3cb5b175f9d04"; // your clientId
const redirectUri = "http://localhost:3000"; // your redirect URL - must be localhost URL and/or HTTPS

const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-follow-modify",
  "user-follow-read",
  "user-read-playback-position",
  "user-top-read",
  "user-read-recently-played",
  "user-library-modify",
  "user-library-read",
  "user-read-email",
  "user-read-private",
];

export const loginUrl = `${authEndpoint}
?client_id=${clientId}
&redirect_uri=${redirectUri}
&scope=${scopes.join("%20")}
&response_type=token
&show_dialog=true`;

export const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);

      return initial;
    }, {});
};

export const spotifyStyle = {
  margin: "1rem 1rem 0 0",
  border: "0",
  borderRadius: "20px",
  padding: "10px 3rem",
  fontSize: "0.8rem",
  fontFamily: "Arial, Helvetica, sans-serif",
  textTransform: "uppercase",
  fontWeight: "bold",
  backgroundColor: "#1ed760",
  color: "black",
  textDecoration: "none",
};

export const spotifyPlaybackStyle = {
  bgColor: "#333",
  color: "#fff",
  loaderColor: "#fff",
  sliderColor: "#1cb954",
  savedColor: "#fff",
  trackArtistColor: "#ccc",
  trackNameColor: "#fff",
  trackNameFont: "Arial, Helvetica, sans-serif",
};
