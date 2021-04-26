// SPA = utiliza o fetch dentro da Home (aguarda dados carregarem)
    // useEffect( () => {
    //   fetch('http://localhost:3333/episodes')
    //   .then(response => response.json())
    //   .then(data => console.log(data))

  // }, [])

// SSR = acessa uma vez acada refresh
    // export async function getServerSideProps(){
    //   const response = await fetch('http://localhost:3333/episodes')
    //   const data = await response.json();

    //   return {
    //     props: {
    //       episodes:data,
    //     }
    //   }

    // }

// SSG = melhor método recarrega uma vez ao "dia" ajuda em performance = so roda em prod
      // export async function getStaticProps(){
      //   const response = await fetch('http://localhost:3333/episodes')
      //   const data = await response.json();

      //   return {
      //     props: {
      //       episodes:data,
      //     }, 
              //Ponto de revalidação  segundo, minuto, hr
      //     revalidate: 60 * 60 * 8,
      //   }

      // }

import { GetStaticProps } from 'next';
import { api } from '../services/api';
import {format, parseISO} from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from '../pages/home.module.scss'
import { usePlayer } from '../contexts/PlayerContext';

type Episode = {
  id: string, 
  title: string,
  thumbnail: string,
  members: string,
  publishedAt:string,
  duration:number,
  durationAsString: string, 
  description:string,
  url: string,
}

type HomeProps = {
  allEpisodes: Episode[];
  latestEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes } : HomeProps) {

  const { playList } = usePlayer()
  const episodeList = [ ...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
      <h2>Últimos Lançamentos</h2>
      <ul>
        {latestEpisodes.map((episode, index) => {
          return(
            <li key={episode.id}>
              <Image 
              width={192} 
              height={192} 
              objectFit="cover"
              src={episode.thumbnail} 
              alt={episode.title}/>
              <div className={styles.episodeDetails}>
                <Link  href={`/episodes/${episode.id}`} >
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
              </div>
              <button type="button" onClick={ () => playList(episodeList, index) } >
                <img src="/play-green.svg" alt="Tocar episódio"/>
              </button>
            </li>
          )
        })}
      </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos Episódios </h2>
          <table cellSpacing={0} >
            <thead>
              <tr>
                <th></th>
                <th>Podcast </th>
                <th>Integrantes </th>
                <th> Data </th>
                <th> Duração </th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                    <tr key={episode.id} >
                      <td style={{width:72}} >
                       <Image 
                        width={120} 
                        height={120} 
                        objectFit="cover"
                        src={episode.thumbnail} 
                        alt={episode.title}/> 
                      </td>
                      <td>
                        <Link href={`/episodes/${episode.id}`} ><a >{episode.title}</a></Link>
                      </td>
                      <td>{episode.members}</td>
                      <td style={{width:100}} >{episode.publishedAt}</td>
                      <td>{episode.durationAsString}</td>
                      <td>
                        <button type='button' onClick={() => playList(episodeList, index + latestEpisodes.length)} >
                          <img src="/play-green.svg" alt="Tocar Episódio"/>
                        </button>
                      </td> 
                    </tr>
                  )
              })}
            </tbody>
          </table>
        
      </section>

    </div>
  )
}


export  const  getStaticProps: GetStaticProps = async () => {
  const {data} = await api.get('episodes', {
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale:ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    }
  })
 
const latestEpisodes = episodes.slice(0,2)
const allEpisodes = episodes.slice(2, episodes.length)


  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8,
  }

}