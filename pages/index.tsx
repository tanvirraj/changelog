import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { getArticleSlugs } from "lib/get-articles-slugs";
import { PaginatedArticles } from "components/paginated-articles";

const ARTICLES_PER_PAGE = 4;

const Page = ({ slugs }) => {
  const router = useRouter();
  const page = parseInt(router.query.page as string);

  const Articles = slugs.map((slug) => dynamic(() => import(`./changelogs/${slug}.mdx`)));

  return (
    <PaginatedArticles page={page}>
      {Articles.map((Article, index) => (
        <Article key={index} hideLayout={true} hideHead={true} hideAuthors={true} />
      ))}
    </PaginatedArticles>
  );
};

export async function getStaticProps() {
  const slugs = getArticleSlugs();

  const results = await Promise.allSettled(slugs.map((slug) => import(`./changelogs/${slug}.mdx`)));

  const meta = results
    .map((res) => res.status === "fulfilled" && res.value.meta)
    .filter((item) => item);

  meta.sort((a, b) => {
    const dateB = new Date(b.publishedAt);
    const dateA = new Date(a.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const start = 0;
  const end = ARTICLES_PER_PAGE;
  const recents = meta.slice(start, end).map((item) => item.slug);

  return {
    props: { slugs: recents },
    revalidate: 1,
  };
}

export default Page;
