import axios from "axios";
import { Constant } from "./constants";
import useStore from "./useStore";

export const get = async (
  path: string,
  auth = true,
  config: any = {},
  loading = true
) => {
  const { token, clearStore, setLoading, setSnackbarText } =
    useStore.getState();
  try {
    if (loading) {
      setLoading(true);
    }
    if (auth) {
      config = {
        ...config,
        headers: config.headers ? { ...config.headers, token } : { token },
      };
    }
    const response = await axios.get(`${Constant.API_URL}${path}`, config);
    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response.status == 401) {
      clearStore();
    } else if (error.response?.data?.showMessage) {
      setSnackbarText(error.response?.data?.message);
    } else {
      setSnackbarText("Something went wrong!");
    }
  } finally {
    if (loading) {
      setLoading(false);
    }
  }
};

export const post = async (
  path: string,
  data: any = {},
  auth = true,
  config: any = {},
  loading = true
) => {
  const { token, clearStore, setLoading, setSnackbarText } =
    useStore.getState();
  try {
    if (loading) {
      setLoading(true);
    }
    if (auth) {
      config = {
        ...config,
        headers: config.headers ? { ...config.headers, token } : { token },
      };
    }
    const response = await axios.post(
      `${Constant.API_URL}${path}`,
      data,
      config
    );
    return response;
  } catch (error: any) {
    console.error(error);
    if (error.response.status == 401) {
      clearStore();
    } else if (error.response?.data?.showMessage) {
      setSnackbarText(error.response?.data?.message);
    } else {
      setSnackbarText("Something went wrong!");
    }
  } finally {
    if (loading) {
      setLoading(false);
    }
  }
};
