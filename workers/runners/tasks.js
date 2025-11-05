import getSockets from "../helpers/getSockets.js";

export default async (job) => {
  try {
    const sockets = await getSockets()
    console.log(sockets);
    switch (job.name) {
      case 'ANNOTATE_PER_UTTERANCE': {
        console.log('Annotating per utterance');
        break;
      }
      case 'ANNOTATE_PER_SESSION': {
        console.log('Annotating per session');
        break;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}
